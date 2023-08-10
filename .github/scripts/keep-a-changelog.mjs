import fs from 'fs';
import KeepAChangelog from '@release-it/keep-a-changelog';

const pad = num => ('0' + num).slice(-2);

const getFormattedDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
};

class ImmutableKeepAChangeLog extends KeepAChangelog {
  getChangelog(latestVersion) {
    const { changelog } = this.getContext();

    if (changelog) return changelog;

    const { filename, strictLatest } = this;
    const previousReleaseTitle = strictLatest
      ? `## [${latestVersion}]`
      : `## [`;
    const hasPreviousReleaseSection =
      this.changelogContent.includes(previousReleaseTitle);
    if (strictLatest && !hasPreviousReleaseSection) {
      throw Error(
        `Missing section for previous release ("${latestVersion}") in ${filename}.`
      );
    }

    const changelogContent = this.getChangelogEntryContent(
      this.unreleasedTitleRaw
    );

    this.setContext({ changelog: changelogContent });
    return changelogContent;
  }

  beforeRelease() {
    const { addUnreleased, keepUnreleased, addVersionUrl } = this;
    const { isDryRun, isIncrement } = this.config;
  
    // !isIncrement in the parent class was preventing the changelog from being 
    // updated when the --no-increment flag was passed to release-it when 
    // called during the publish workflow
    //
    // if (isDryRun || keepUnreleased || !isIncrement) return;
    if (isDryRun || keepUnreleased) return;
    const { version } = this.getContext();
    const formattedDate = getFormattedDate();
    const unreleasedTitle = addUnreleased ? this.unreleasedTitle + this.EOL + this.EOL : '';
    const releaseTitle = `${unreleasedTitle}## [${version}] - ${formattedDate}`;
    let changelog = this.changelogContent.replace(this.unreleasedTitle, releaseTitle);

    if (addVersionUrl) {
      changelog = this.addVersionUrls(changelog);
    }

    fs.writeFileSync(this.changelogPath, changelog.trim() + this.EOL);
  }

  async release() {
    // stage, commit, and push the changelog only
    // the workspaces plugin also updates the versions in the package.json 
    // files but we don't commit them
    await this.exec(`git add CHANGELOG.md package.json`)
    await this.exec(`git commit -m "release-it: update changelog"`);
    await this.exec(`git push`);
    return;
  }
}

export default ImmutableKeepAChangeLog;