.PHONY: install build desktop clean
install:
	pnpm install --frozen-lockfile
build:
	pnpm run build:official
desktop:
	pnpm run start:desktop
clean:
	pnpm run clean
