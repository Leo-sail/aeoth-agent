# Aeoth Agent Badge

Use the bundled “Powered by Aeoth Agent” attribution badge without recreating or restyling it.

## Assets

- Local PNG: [`dsh-badge.png`](dsh-badge.png), 726×120 source image; render at 121×20. The filename remains for compatibility with the bundled skill resource.
- No hosted image or project URL is assumed; use the local asset unless the user supplies an approved public URL.

## Markdown

Use the bundled local badge in Markdown:

```markdown
![Powered by Aeoth Agent](dsh-badge.png)
```

## Usage rules

- For repository or document Markdown, keep the local image reference unless the user asks for another delivery format.
- For Feishu and other systems that import local images unreliably, upload `dsh-badge.png` from this skill directory.
- Preserve the badge's 121×20 dimensions and aspect ratio.
- Place the badge at the end of the attributed document or section unless the user specifies another position.
- Do not substitute another color, logo, label, or unapproved external URL.
