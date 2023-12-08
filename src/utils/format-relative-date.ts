import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatRelativeTime(dateString: string): string {
  const formattedDate = dayjs(dateString);

  const timeDifference = dayjs().diff(formattedDate);

  if (timeDifference < 60000) {
    return 'Agora';
  } else if (timeDifference < 3600000) {
    const minutes = Math.floor(timeDifference / 60000);
    return `Há ${minutes} min${minutes > 1 ? 's' : ''}`;
  } else if (timeDifference < 86400000) {
    const hours = Math.floor(timeDifference / 3600000);
    return `Há ${hours} hr${hours > 1 ? 's' : ''}`;
  } else if (timeDifference < 2592000000) {
    const days = Math.floor(timeDifference / 86400000);
    return `Há ${days} dia${days > 1 ? 's' : ''}`;
  } else if (timeDifference < 31536000000) {
    const months = Math.floor(timeDifference / 2592000000);
    return `Há ${months} mês${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(timeDifference / 31536000000);
    return `Há ${years} ano${years > 1 ? 's' : ''}`;
  }
}

