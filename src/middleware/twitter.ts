import { split } from '../util';
import { Twitter } from '../model';
import config from '../config';
import { MessageEventListener } from 'cq-websocket';

/**
 * Return a shifted Date by given days
 * @param days days to be shifted
 */
function deltaDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

const TwitterMiddleware: MessageEventListener = async (event, ctx, tags) => {
  const [_, param] = split(ctx.raw_message);
  const daysBefore = param ? Number.parseInt(param, 10) : 0;
  if (Number.isNaN(daysBefore) || daysBefore < 0) {
    return '兄啊格式不对';
  }
  let screenName: string;
  if (config.aigisGroups.includes(ctx.group_id)) {
    screenName = 'Aigis1000';
  } else {
    return;
  }
  const twitters = await Twitter.find({
    time: { $gte: deltaDays(-daysBefore - 1), $lt: deltaDays(-daysBefore) },
    'user.screenName': screenName,
  });
  twitters.sort((a, b) => {
    const sa = a.time.getTime();
    const sb = b.time.getTime();
    if (sa > sb) {
      return 1;
    }
    if (sa === sb) {
      return 0;
    }
    return -1;
  });
  if (twitters.length !== 0) {
    return ([] as any[]).concat(
      ...(await Promise.all(twitters.map(t => t.toArray()))),
    );
  } else {
    return '莫得推特';
  }
};

export default TwitterMiddleware;
