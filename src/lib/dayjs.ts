import dayjsInstance from "dayjs";

import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import "dayjs/locale/pt-br";

dayjsInstance.extend(isBetween)
dayjsInstance.extend(isSameOrBefore)
dayjsInstance.extend(isSameOrAfter)
dayjsInstance.extend(utc)
dayjsInstance.extend(timezone)

dayjsInstance.locale('pt-br')
dayjsInstance.tz.setDefault('America/Sao_Paulo')

export const dayjs = dayjsInstance;

