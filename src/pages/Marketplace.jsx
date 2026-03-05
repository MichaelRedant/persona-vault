import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import Header from '../components/Header';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import ListingManageModal from '../components/ListingManageModal';
import ListingReportModal from '../components/ListingReportModal';
import MarketplaceModerationModal from '../components/MarketplaceModerationModal';
import StatePanel from '../components/StatePanel';
import Toast from '../components/Toast';
import { useMarketplaceApi } from '../hooks/useMarketplaceApi';

const PLACEHOLDER = '/logo-512.png';
const DEFAULT_SORT = 'recent';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'popular', label: 'Most popular' },
  { value: 'favorites', label: 'Most favorited' },
  { value: 'relevance', label: 'Best match' },
  { value: 'price_asc', label: 'Price low to high' },
  { value: 'price_desc', label: 'Price high to low' },
];

const KIND_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'persona', label: 'Persona' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'asset', label: 'Asset' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'removed', label: 'Removed' },
];

const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'All visibility' },
  { value: 'public', label: 'Public' },
  { value: 'unlisted', label: 'Unlisted' },
  { value: 'private', label: 'Private' },
];

export default function Marketplace({ token }) {
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortOption, setSortOption] = useState(DEFAULT_SORT);
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [availableTags, setAvailableTags] = useState([]);
  const [manageOpen, setManageOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [active, setActive] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [itemOptions, setItemOptions] = useState({ personas: [], prompts: [] });
  const [loadingItemOptions, setLoadingItemOptions] = useState(false);
  const [pendingDeleteListing, setPendingDeleteListing] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingsError, setListingsError] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [moderationOpen, setModerationOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [workingReportId, setWorkingReportId] = useState(null);
  const [activeEvents, setActiveEvents] = useState([]);
  const [loadingActiveEvents, setLoadingActiveEvents] = useState(false);
  const [activeEventsError, setActiveEventsError] = useState('');

  const didInit = useRef(false);
  const pendingOpenListingIdRef = useRef(null);

  const {
    searchListings,
    trackDownload,
    uploadFile,
    createListing,
    updateListing,
    deleteListing,
    getListableItems,
    reportListing,
    getListingReports,
    getListingEvents,
    resolveListingReport,
  } = useMarketplaceApi(token);

  const mapCovers = useCallback((data) => (
    data.map((entry) => ({
      ...entry,
      cover_url: entry.cover_url || PLACEHOLDER,
      is_owner: Boolean(entry.is_owner),
      can_manage: Boolean(entry.can_manage),
      seller_verified: Boolean(entry.seller_verified),
      trusted_seller: Boolean(entry.trusted_seller),
      downloads_count: Number(entry.downloads_count || 0),
      favorites_count: Number(entry.favorites_count || 0),
      tags: Array.isArray(entry.tags) ? entry.tags : [],
      status: entry.status || 'active',
      visibility: entry.visibility || 'public',
    }))
  ), []);

  const buildTagFacets = useCallback((listings) => {
    const counts = new Map();

    listings.forEach((entry) => {
      const tags = Array.isArray(entry.tags) ? entry.tags : [];
      tags.forEach((tag) => {
        const label = String(tag || '').trim();
        if (!label) {
          return;
        }

        const key = label.toLowerCase();
        const current = counts.get(key);
        if (current) {
          current.count += 1;
        } else {
          counts.set(key, { label, count: 1 });
        }
      });
    });

    return Array.from(counts.values())
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.label.localeCompare(b.label);
      })
      .slice(0, 30)
      .map((entry) => entry.label);
  }, []);

  const load = useCallback(async ({
    query = q,
    kind = kindFilter,
    tag = tagFilter,
    sort = sortOption,
    status = statusFilter,
    visibility = visibilityFilter,
  } = {}) => {
    setLoadingListings(true);
    setListingsError('');

    try {
      const params = {
        q: query,
        limit: 24,
        sort,
      };

      if (kind) {
        params.kind = kind;
      }
      if (tag) {
        params.tag = tag;
      }

      if (isAdmin) {
        if (status && status !== 'all') {
          params.status = status;
        }
        if (visibility && visibility !== 'all') {
          params.visibility = visibility;
        }
      }

      const data = await searchListings(params);
      const mapped = mapCovers(data.items || []);
      setItems(mapped);

      const tagsFromMeta = Array.isArray(data.meta?.available_tags) ? data.meta.available_tags : [];
      const fallbackTags = buildTagFacets(mapped);
      setAvailableTags(tagsFromMeta.length > 0 ? tagsFromMeta : fallbackTags);

      const pendingListingId = pendingOpenListingIdRef.current;
      if (pendingListingId) {
        const match = mapped.find((entry) => Number(entry.id) === Number(pendingListingId));
        if (match) {
          setActive(match);
          pendingOpenListingIdRef.current = null;
        }
      }
    } catch (error) {
      setItems([]);
      setListingsError(error?.message || 'Failed to load listings');
      setToastMessage(error?.message || 'Failed to load listings');
    } finally {
      setLoadingListings(false);
    }
  }, [
    q,
    kindFilter,
    tagFilter,
    sortOption,
    statusFilter,
    visibilityFilter,
    isAdmin,
    searchListings,
    mapCovers,
    buildTagFacets,
  ]);

  const hasActiveFilters = useMemo(() => {
    if (q.trim() !== '') return true;
    if (kindFilter !== '') return true;
    if (tagFilter !== '') return true;
    if (sortOption !== DEFAULT_SORT) return true;
    if (isAdmin && statusFilter !== 'all') return true;
    if (isAdmin && visibilityFilter !== 'all') return true;
    return false;
  }, [q, kindFilter, tagFilter, sortOption, isAdmin, statusFilter, visibilityFilter]);

  const loadReports = useCallback(async () => {
    if (!isAdmin) {
      setReports([]);
      return;
    }

    setLoadingReports(true);
    try {
      const itemsRaw = await getListingReports('open', 100);
      setReports(Array.isArray(itemsRaw) ? itemsRaw : []);
    } catch (error) {
      setReports([]);
      setToastMessage(error?.message || 'Failed to load moderation reports');
    } finally {
      setLoadingReports(false);
    }
  }, [isAdmin, getListingReports]);

  useEffect(() => {
    if (!token) {
      setIsAdmin(false);
      setWorkspaceId(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setIsAdmin(Boolean(decoded.is_admin));
      setWorkspaceId(decoded.workspace_id ? Number(decoded.workspace_id) : null);
    } catch {
      setIsAdmin(false);
      setWorkspaceId(null);
    }
  }, [token]);

  useEffect(() => {
    if (!isAdmin) {
      setStatusFilter('all');
      setVisibilityFilter('all');
    }
  }, [isAdmin]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const listingId = Number(params.get('listing') || 0);
    if (Number.isFinite(listingId) && listingId > 0) {
      pendingOpenListingIdRef.current = listingId;
    }
  }, [location.search]);

  useEffect(() => {
    const pendingListingId = pendingOpenListingIdRef.current;
    if (!pendingListingId || items.length === 0) {
      return;
    }

    const match = items.find((entry) => Number(entry.id) === Number(pendingListingId));
    if (match) {
      setActive(match);
      pendingOpenListingIdRef.current = null;
    }
  }, [items]);

  const loadListingEvents = useCallback(async (listingId) => {
    if (!listingId || !token) {
      setActiveEvents([]);
      setActiveEventsError('');
      return;
    }

    setLoadingActiveEvents(true);
    setActiveEventsError('');

    try {
      const itemsRaw = await getListingEvents(listingId, 30);
      setActiveEvents(Array.isArray(itemsRaw) ? itemsRaw : []);
    } catch (error) {
      setActiveEvents([]);
      setActiveEventsError(error?.message || 'Failed to load listing history');
    } finally {
      setLoadingActiveEvents(false);
    }
  }, [token, getListingEvents]);

  useEffect(() => {
    if (!active?.id) {
      setActiveEvents([]);
      setActiveEventsError('');
      setLoadingActiveEvents(false);
      return;
    }

    loadListingEvents(active.id);
  }, [active?.id, loadListingEvents]);

  const loadItemOptions = useCallback(async () => {
    if (!workspaceId) {
      setItemOptions({ personas: [], prompts: [] });
      return;
    }

    setLoadingItemOptions(true);
    try {
      const listable = await getListableItems(workspaceId);
      setItemOptions(listable);
    } catch (error) {
      setItemOptions({ personas: [], prompts: [] });
      setToastMessage(error?.message || 'Failed to load source items');
    } finally {
      setLoadingItemOptions(false);
    }
  }, [workspaceId, getListableItems]);

  useEffect(() => {
    if (!manageOpen || editing) {
      return;
    }

    loadItemOptions();
  }, [manageOpen, editing, loadItemOptions]);

  useEffect(() => {
    if (didInit.current) {
      return;
    }

    didInit.current = true;
    load();
  }, [load]);

  const handleConfirmDeleteListing = async () => {
    if (!pendingDeleteListing) {
      return;
    }

    try {
      await deleteListing(pendingDeleteListing.id);
      await load();
      setToastMessage('Listing deleted');
    } catch (error) {
      setToastMessage(error?.message || 'Failed to delete listing');
    } finally {
      setPendingDeleteListing(null);
    }
  };

  const handleSubmitReport = async (reason, details) => {
    if (!reportTarget) {
      return;
    }

    setReportBusy(true);
    try {
      await reportListing(reportTarget.id, reason, details);
      setToastMessage('Report submitted. Thank you.');
      setReportTarget(null);
    } catch (error) {
      setToastMessage(error?.message || 'Failed to submit report');
    } finally {
      setReportBusy(false);
    }
  };

  const handleResolveReport = async (reportId, reportStatus, listingStatus) => {
    setWorkingReportId(reportId);
    try {
      await resolveListingReport(reportId, reportStatus, listingStatus);
      await Promise.all([loadReports(), load()]);
      setToastMessage('Moderation action saved');
    } catch (error) {
      setToastMessage(error?.message || 'Failed to apply moderation action');
    } finally {
      setWorkingReportId(null);
    }
  };

  const handleCopyListingLink = async (listingId) => {
    try {
      const shareUrl = `${window.location.origin}${location.pathname}?listing=${listingId}`;
      await navigator.clipboard.writeText(shareUrl);
      setToastMessage('Listing link copied');
    } catch {
      setToastMessage('Could not copy listing link');
    }
  };

  const handleResetFilters = async () => {
    setQ('');
    setKindFilter('');
    setTagFilter('');
    setSortOption(DEFAULT_SORT);
    setStatusFilter('all');
    setVisibilityFilter('all');

    await load({
      query: '',
      kind: '',
      tag: '',
      sort: DEFAULT_SORT,
      status: 'all',
      visibility: 'all',
    });
  };

  const handleApplyFilters = async () => {
    await load();
  };

  return (
    <>
      <Header
        personas={[]}
        prompts={[]}
        searchTerm={q}
        setSearchTerm={setQ}
        username=""
        onOpenProfile={() => {}}
        createPersona={() => {}}
        createPrompt={() => {}}
        fetchPersonas={() => {}}
        fetchPrompts={() => {}}
        deletePersona={() => {}}
        deletePrompt={() => {}}
        handleUpdateTags={() => {}}
        onLogout={() => {
          localStorage.removeItem('vault_jwt_token');
          window.location.href = '/vault';
        }}
        isAdmin={isAdmin}
        onOpenAdminPanel={() => {}}
        onToggleSidebar={() => {}}
        onShowToast={setToastMessage}
        canEditWorkspace={false}
      />

      <main className="min-h-screen pv-page-shell p-4 sm:p-6">
        {toastMessage && (
          <div className="fixed top-4 right-4 z-[9999]">
            <Toast message={toastMessage} onClose={() => setToastMessage('')} />
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="pv-panel p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl pv-heading">Marketplace</h1>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-[var(--pv-radius-md)] border border-[var(--pv-border)] bg-[var(--pv-surface)] px-4 py-2 text-sm font-medium hover:bg-[var(--pv-surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Back to Workspace
            </Link>
          </div>

          <div className="pv-panel p-4 mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleApplyFilters();
                  }
                }}
                placeholder="Search listings..."
                className="flex-1 pv-input pv-input-pill text-sm"
              />
              <Button className="rounded-full px-5" onClick={handleApplyFilters} disabled={loadingListings}>
                {loadingListings ? 'Loading...' : 'Search'}
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  className="rounded-full px-5"
                  onClick={async () => {
                    setModerationOpen(true);
                    await loadReports();
                  }}
                >
                  Moderation
                </Button>
              )}
              <Button
                variant="secondary"
                className="rounded-full px-5"
                onClick={() => {
                  setEditing(null);
                  setManageOpen(true);
                }}
              >
                + New Listing
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              <select
                className="pv-input text-sm"
                value={kindFilter}
                onChange={(event) => setKindFilter(event.target.value)}
                aria-label="Filter by type"
              >
                {KIND_OPTIONS.map((option) => (
                  <option key={option.value || 'all-kinds'} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                className="pv-input text-sm"
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                aria-label="Filter by tag"
              >
                <option value="">All tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              <select
                className="pv-input text-sm"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                aria-label="Sort listings"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {isAdmin && (
                <select
                  className="pv-input text-sm"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              )}

              {isAdmin && (
                <select
                  className="pv-input text-sm"
                  value={visibilityFilter}
                  onChange={(event) => setVisibilityFilter(event.target.value)}
                  aria-label="Filter by visibility"
                >
                  {VISIBILITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              )}

              <Button
                variant="outline"
                className="text-sm"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters && !loadingListings}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {loadingListings ? (
            <StatePanel
              variant="loading"
              title="Loading listings..."
              description="Fetching marketplace items."
            />
          ) : listingsError ? (
            <StatePanel
              variant="error"
              title="Could not load marketplace listings"
              description={listingsError}
              actionLabel="Retry"
              onAction={handleApplyFilters}
            />
          ) : items.length === 0 ? (
            <StatePanel
              variant="empty"
              title={q.trim() || hasActiveFilters ? 'No listings found' : 'No listings published yet'}
              description={q.trim() || hasActiveFilters
                ? 'No marketplace items match your current filters.'
                : 'Create your first listing to populate the marketplace.'}
              actionLabel={hasActiveFilters ? 'Clear filters' : 'New Listing'}
              onAction={hasActiveFilters
                ? handleResetFilters
                : () => {
                  setEditing(null);
                  setManageOpen(true);
                }}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const canManageListing = item.can_manage || isAdmin;
                return (
                  <div key={item.id} className="relative">
                    <ListingCard
                      item={item}
                      canManage={canManageListing}
                      onDownload={async () => {
                        await trackDownload(item.id);
                        if (item.file_url) {
                          window.open(item.file_url, '_blank', 'noopener');
                        } else {
                          setToastMessage('Download tracked. No direct file attached to this listing.');
                        }
                      }}
                      onClick={() => setActive(active?.id === item.id ? null : item)}
                      onEdit={() => {
                        setEditing(item);
                        setManageOpen(true);
                      }}
                      onDelete={() => {
                        setPendingDeleteListing(item);
                      }}
                    />
                    {active?.id === item.id && (
                      <ListingDetailsModal
                        item={active}
                        canManage={canManageListing}
                        canReport={Boolean(token) && !canManageListing}
                        canViewEvents={Boolean(token)}
                        events={activeEvents}
                        eventsLoading={loadingActiveEvents}
                        eventsError={activeEventsError}
                        onReport={() => setReportTarget(active)}
                        onCopyLink={() => handleCopyListingLink(active.id)}
                        onClose={() => setActive(null)}
                        onDownload={async () => {
                          await trackDownload(item.id);
                          if (item.file_url) {
                            window.open(item.file_url, '_blank', 'noopener');
                          } else {
                            setToastMessage('Download tracked. No direct file attached to this listing.');
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <ListingManageModal
            open={manageOpen}
            onClose={() => setManageOpen(false)}
            initial={editing}
            uploadFn={uploadFile}
            allowStatusEdit={isAdmin}
            onSave={async (payload) => {
              try {
                if (payload.id) {
                  await updateListing(payload);
                } else {
                  await createListing({
                    ...payload,
                    currency: 'EUR',
                    visibility: 'public',
                    tags: payload.tags || '',
                  });
                }

                setManageOpen(false);
                await load();
                setToastMessage(payload.id ? 'Listing updated' : 'Listing created');
              } catch (error) {
                setToastMessage(error?.message || 'Failed to save listing');
              }
            }}
            onDelete={async (id) => {
              try {
                await deleteListing(id);
                setManageOpen(false);
                await load();
                setToastMessage('Listing deleted');
              } catch (error) {
                setToastMessage(error?.message || 'Failed to delete listing');
              }
            }}
            onShowToast={setToastMessage}
            itemOptions={itemOptions}
            loadingItemOptions={loadingItemOptions}
          />
        </div>
      </main>

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteListing)}
        onClose={() => setPendingDeleteListing(null)}
        onConfirm={handleConfirmDeleteListing}
        title="Delete Listing"
        description={`Delete "${pendingDeleteListing?.title || 'this listing'}"? This cannot be undone.`}
      />

      <ListingReportModal
        open={Boolean(reportTarget)}
        item={reportTarget}
        busy={reportBusy}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
      />

      <MarketplaceModerationModal
        open={moderationOpen}
        onClose={() => setModerationOpen(false)}
        reports={reports}
        loading={loadingReports}
        workingReportId={workingReportId}
        onResolve={handleResolveReport}
      />
    </>
  );
}
