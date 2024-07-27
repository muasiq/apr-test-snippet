# Use a Debian-based slim Node image
FROM node:20.11-bullseye-slim AS base
RUN apt-get update
RUN apt-get install ca-certificates --yes

# ================== Deps
FROM base AS deps
WORKDIR /workspace

COPY package.json package-lock.json  ./
COPY prisma ./
RUN npm ci

# Install sharp globally
RUN npm install -g --arch=x64 --platform=linux --libc=glibc sharp@0.33.0-rc.2


# ================== Build
FROM base AS builder
WORKDIR /workspace
COPY . .
COPY --from=deps /workspace/node_modules ./node_modules

ARG APRICOT_ENV
ARG PRISMA_FIELD_ENCRYPTION_KEY
ENV APRICOT_ENV $APRICOT_ENV
ENV NEXT_PUBLIC_APRICOT_ENV $APRICOT_ENV
ENV PRISMA_FIELD_ENCRYPTION_KEY $PRISMA_FIELD_ENCRYPTION_KEY

ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_MUI_PRO_LICENSE_KEY="2c329ec915a42cd00ef10303c3fe497bTz04Mjc4NixFPTE3Mzc2NDkzMzIwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
ENV SENTRY_AUTH_TOKEN="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"
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyCbSBRdLGSqc4VN0H7dO4b1N80NnbuQaFU"

RUN SKIP_ENV_VALIDATION=1 npm run build


# ================== Runner
FROM base AS runner
WORKDIR /workspace

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PRISMA_FIELD_ENCRYPTION_KEY $PRISMA_FIELD_ENCRYPTION_KEY
ENV APRICOT_ENV $APRICOT_ENV

# Set the path to the global installation of sharp
ENV NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next && \
    chown nextjs:nodejs .next

# Copy the global sharp installation
COPY --from=deps --chown=nextjs:nodejs /usr/local/lib/node_modules/sharp /usr/local/lib/node_modules/sharp

# Copy Next.js built artifacts (adjust these paths based on your project structure)
COPY --from=builder --chown=nextjs:nodejs /workspace/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/.next/static ./.next/static

# Include public directory (adjust this path based on your project structure)
COPY --from=builder /workspace/public /workspace/public

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Run the app (adjust the command based on your project's entry point)
CMD ["node", "server.js"]
