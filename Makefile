.PHONY: install build web clean
install:
	pnpm install --frozen-lockfile
build:
	pnpm run build:official
web:
	pnpm run start:web
clean:
	pnpm run clean
