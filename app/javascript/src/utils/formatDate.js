import { DATE_TIME_FORMAT } from 'constants'

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, DATE_TIME_FORMAT)

export const formatDateTime = (value) =>
  dateTimeFormatter.format(new Date(value))
