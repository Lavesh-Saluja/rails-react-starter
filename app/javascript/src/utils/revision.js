import { SHORT_REVISION_LENGTH } from 'constants'

// '0482313dbbad…' => '0482313'; null when the revision is unknown.
export const shortRevision = (revision) =>
  revision ? revision.slice(0, SHORT_REVISION_LENGTH) : null
