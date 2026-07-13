const USER_AGENT = "dronegohub-etl (https://github.com/LiangYingC/drone-go-hub)";

/** Fetch a URL as text, with one retry — government endpoints flake sometimes. */
export async function fetchText(url: string, attempt = 1): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } catch (error) {
    if (attempt >= 2) throw error;
    await sleep(2000);
    return fetchText(url, attempt + 1);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
