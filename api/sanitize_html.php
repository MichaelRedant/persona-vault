<?php
declare(strict_types=1);

if (!function_exists('pv_normalize_utf8')) {
    function pv_normalize_utf8(string $value): string
    {
        if (function_exists('mb_check_encoding') && function_exists('mb_convert_encoding')) {
            if (!mb_check_encoding($value, 'UTF-8')) {
                $converted = mb_convert_encoding($value, 'UTF-8', 'UTF-8,ISO-8859-1,Windows-1252');
                return $converted === false ? '' : $converted;
            }
        }

        return $value;
    }
}

if (!function_exists('pv_sanitize_text')) {
    function pv_sanitize_text(string $value, int $maxLength = 255): string
    {
        $value = pv_normalize_utf8($value);
        $value = strip_tags($value);
        $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? $value;
        $value = preg_replace('/\s+/u', ' ', $value) ?? $value;
        $value = trim($value);

        if ($maxLength > 0) {
            if (function_exists('mb_strlen') && function_exists('mb_substr')) {
                if (mb_strlen($value) > $maxLength) {
                    $value = mb_substr($value, 0, $maxLength);
                }
            } elseif (strlen($value) > $maxLength) {
                $value = substr($value, 0, $maxLength);
            }
        }

        return $value;
    }
}

if (!function_exists('pv_sanitize_tag_list')) {
    /**
     * @param mixed $tags
     * @return array<int, string>
     */
    function pv_sanitize_tag_list($tags): array
    {
        if (!is_array($tags)) {
            return [];
        }

        $sanitized = [];
        foreach ($tags as $tag) {
            $cleanTag = pv_sanitize_text((string)$tag, 80);
            if ($cleanTag === '') {
                continue;
            }
            if (!in_array($cleanTag, $sanitized, true)) {
                $sanitized[] = $cleanTag;
            }
            if (count($sanitized) >= 30) {
                break;
            }
        }

        return $sanitized;
    }
}

if (!function_exists('pv_tags_to_csv')) {
    /**
     * @param array<int, string> $tags
     */
    function pv_tags_to_csv(array $tags): string
    {
        return implode(',', $tags);
    }
}

if (!function_exists('pv_is_safe_link_href')) {
    function pv_is_safe_link_href(string $href): bool
    {
        $href = trim($href);
        if ($href === '') {
            return false;
        }

        if (
            str_starts_with($href, '#') ||
            str_starts_with($href, '/') ||
            str_starts_with($href, './') ||
            str_starts_with($href, '../')
        ) {
            return true;
        }

        $scheme = strtolower((string)parse_url($href, PHP_URL_SCHEME));
        return in_array($scheme, ['http', 'https', 'mailto'], true);
    }
}

if (!function_exists('pv_unwrap_dom_node')) {
    function pv_unwrap_dom_node(DOMNode $node): void
    {
        $parent = $node->parentNode;
        if (!$parent) {
            return;
        }

        while ($node->firstChild) {
            $parent->insertBefore($node->firstChild, $node);
        }
        $parent->removeChild($node);
    }
}

if (!function_exists('pv_allowed_html_tags')) {
    /**
     * @return array<int, string>
     */
    function pv_allowed_html_tags(): array
    {
        return [
            'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
            'a', 'h1', 'h2', 'h3', 'h4',
        ];
    }
}

if (!function_exists('pv_escape_disallowed_tags')) {
    function pv_escape_disallowed_tags(string $html, array $allowedTags): string
    {
        return preg_replace_callback(
            '/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/u',
            static function (array $matches) use ($allowedTags): string {
                $tagName = strtolower((string)($matches[1] ?? ''));
                $fullMatch = (string)($matches[0] ?? '');
                if ($tagName !== '' && in_array($tagName, $allowedTags, true)) {
                    return $fullMatch;
                }

                return htmlspecialchars($fullMatch, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            },
            $html
        ) ?? $html;
    }
}

if (!function_exists('pv_sanitize_html')) {
    function pv_sanitize_html(string $html): string
    {
        $html = trim(pv_normalize_utf8($html));
        if ($html === '') {
            return '';
        }

        $allowedTags = pv_allowed_html_tags();
        // Keep unknown/custom tags as visible text (e.g. <Name>) instead of dropping content.
        $html = pv_escape_disallowed_tags($html, $allowedTags);

        if (!class_exists('DOMDocument')) {
            $allowed = '<p><br><strong><em><b><i><u><s><ul><ol><li><blockquote><code><pre><a><h1><h2><h3><h4>';
            return trim((string)strip_tags($html, $allowed));
        }

        $previousInternalErrors = libxml_use_internal_errors(true);

        $doc = new DOMDocument();
        $loaded = $doc->loadHTML(
            '<!DOCTYPE html><html><body>' . $html . '</body></html>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NOERROR | LIBXML_NOWARNING
        );

        if (!$loaded) {
            libxml_clear_errors();
            libxml_use_internal_errors($previousInternalErrors);
            return '';
        }

        $allowedAttributes = [
            'a' => ['href', 'title', 'target', 'rel'],
        ];

        $nodes = [];
        foreach ($doc->getElementsByTagName('*') as $node) {
            $nodes[] = $node;
        }

        foreach ($nodes as $node) {
            $tagName = strtolower($node->nodeName);

            if (!in_array($tagName, $allowedTags, true)) {
                pv_unwrap_dom_node($node);
                continue;
            }

            if ($node->attributes === null) {
                continue;
            }

            $attributesToRemove = [];
            foreach ($node->attributes as $attribute) {
                $name = strtolower($attribute->nodeName);
                $value = $attribute->nodeValue ?? '';

                if (str_starts_with($name, 'on') || $name === 'style') {
                    $attributesToRemove[] = $name;
                    continue;
                }

                $allowedForTag = $allowedAttributes[$tagName] ?? [];
                if (!in_array($name, $allowedForTag, true)) {
                    $attributesToRemove[] = $name;
                    continue;
                }

                if ($tagName === 'a' && $name === 'href' && !pv_is_safe_link_href($value)) {
                    $attributesToRemove[] = 'href';
                    continue;
                }

                if ($tagName === 'a' && $name === 'target') {
                    $normalizedTarget = strtolower(trim($value));
                    if ($normalizedTarget !== '_blank') {
                        $attributesToRemove[] = 'target';
                    }
                }
            }

            foreach ($attributesToRemove as $attributeName) {
                $node->removeAttribute($attributeName);
            }

            if ($tagName === 'a' && strtolower(trim((string)$node->getAttribute('target'))) === '_blank') {
                $node->setAttribute('rel', 'noopener noreferrer');
            }
        }

        $body = $doc->getElementsByTagName('body')->item(0);
        $sanitized = '';
        if ($body) {
            foreach ($body->childNodes as $child) {
                $sanitized .= $doc->saveHTML($child);
            }
        }

        libxml_clear_errors();
        libxml_use_internal_errors($previousInternalErrors);

        return trim($sanitized);
    }
}
