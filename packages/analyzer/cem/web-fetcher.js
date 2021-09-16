const CEM_FILE = "/custom-elements.json";

function isDev(origin) {
    return origin.includes("localhost") || origin.includes("127.0.0.1");
}

export async function getLocalCEM(origin, fullPath) {
    if (!isDev(origin)) {
        return null;
    }

    let localCEM = await fetch(origin + CEM_FILE).then(res => res.json()).catch(() => null);
    let path = fullPath.replace(origin, "").split("/").filter(Boolean);

    while (!localCEM && path.length > 0) {
        const cemPath = origin + "/" + path.shift() + CEM_FILE;
        localCEM = await fetch(cemPath).then(res => res.json()).catch(() => null);
    }

    return localCEM;
}
