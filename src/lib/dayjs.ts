import dayjsInstance from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjsInstance.extend(isBetween)
dayjsInstance.extend(isSameOrBefore)
dayjsInstance.extend(isSameOrAfter)
dayjsInstance.extend(utc)
dayjsInstance.extend(timezone)

export const dayjs = dayjsInstance;

