import KeepAChangelog from '@release-it/keep-a-changelog';

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
}

export default ImmutableKeepAChangeLog;
