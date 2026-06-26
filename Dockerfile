# 1. Basis-Image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# 2. Install-Phase (Abhängigkeiten laden)
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
# Wir lassen --frozen-lockfile weg, falls du keine Lock-Datei hochgeladen hast
RUN cd /temp/prod && bun install --production

# 3. Release-Phase (Den finalen Container bauen)
FROM base AS release
# Nur die fertigen node_modules rüberkopieren
COPY --from=install /temp/prod/node_modules node_modules
# Deinen Source-Code reinkopieren
COPY src ./src
COPY package.json .

RUN mkdir -p /usr/src/app/data && chown -R bun:bun /usr/src/app/data

# 4. Sicherheit: Als nicht-root User ausführen
USER bun

# 5. Port freigeben und starten (angepasst auf dein JS-File!)
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.js" ]