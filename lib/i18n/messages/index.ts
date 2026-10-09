// lib/i18n/messages/index.ts
//
// Every UI string, one namespace per area of the site. Each entry carries all
// languages side by side, so a string cannot be added in one language and
// forgotten in another: the type requires both.

import { common } from './common';
import { home } from './home';
import { assess } from './assess';
import { pricing } from './pricing';
import { history } from './history';
import { followup } from './followup';
import { auth } from './auth';
import { account } from './account';
import { payment } from './payment';
import { university } from './university';
import { misc } from './misc';

export const MESSAGES = {
  ...common,
  ...home,
  ...assess,
  ...pricing,
  ...history,
  ...followup,
  ...auth,
  ...account,
  ...payment,
  ...university,
  ...misc,
};

export type MessageKey = keyof typeof MESSAGES;
