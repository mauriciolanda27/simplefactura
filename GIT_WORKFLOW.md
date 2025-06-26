# Git Workflow - SimpleFactura

## Branch Strategy

### Branches
- **`master`** - Production branch (stable, deployable code)
- **`develop`** - Development branch (integration branch for features)

## Development Workflow

### For New Features/Bug Fixes:

1. **Start from develop branch:**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bug-fix
   ```

3. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push your feature branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request:**
   - Go to GitHub and create a PR from `feature/your-feature-name` to `develop`
   - Request code review
   - Merge to `develop` after approval

### For Production Releases:

1. **Ensure develop is stable:**
   ```bash
   git checkout develop
   git pull origin develop
   npm run build
   npm run lint
   npm test
   ```

2. **Merge develop to master:**
   ```bash
   git checkout master
   git pull origin master
   git merge develop
   git push origin master
   ```

3. **Deploy from master branch**

## Commit Message Convention

Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Environment Files

- `.env.local` - Local development (not committed)
- `.env.production` - Production environment variables
- `.env.example` - Example environment file (committed)

## Important Notes

- **Never commit directly to master** - Always use Pull Requests
- **Always test before merging** to develop or master
- **Keep develop branch stable** - it should always build successfully
- **Use descriptive branch names** - e.g., `feature/user-authentication`, `bugfix/invoice-export-error` 