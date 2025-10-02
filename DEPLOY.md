Deploying the static site to GitHub Pages

This repository includes a GitHub Actions workflow that will automatically deploy the repository contents to the `gh-pages` branch whenever you push to `main`.

Steps to deploy:

1. Commit and push your changes to the `main` branch:

   git add .
   git commit -m "Prepare site for deployment"
   git push origin main

2. The workflow will run automatically. You can watch the progress in: GitHub -> Actions -> Deploy site to GitHub Pages.

3. After the workflow completes, go to your repository Settings -> Pages and set the source to the `gh-pages` branch (if it's not already set). The site will be published at:

   https://<your-github-username>.github.io/<repository-name>/

Notes:
- The action used: JamesIves/github-pages-deploy-action@v4.
- If you want to publish a subfolder (for example `docs/`), update `.github/workflows/deploy.yml` and set `FOLDER: 'docs'`.
- If you prefer to deploy to `docs/` branch instead, change BRANCH in the workflow and set GitHub Pages to use that branch.

If you want, I can:
- Change the workflow to only deploy the `docs/` folder instead of the repository root.
- Create a custom domain configuration (CNAME) if you have a domain.
