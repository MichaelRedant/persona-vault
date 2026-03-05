// utils/tokenChecker.js
export async function testTokenValid(baseUrl, token) {
  try {
    const response = await fetch(`${baseUrl}/test_token.php`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data?.success === true;
  } catch {
    return false;
  }
}
