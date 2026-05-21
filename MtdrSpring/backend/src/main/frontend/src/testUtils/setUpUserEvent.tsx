import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

type RenderOptions = Parameters<typeof render>[1];

export function setUpUserEvent(ui: ReactElement, options?: RenderOptions) {
  const user = typeof (userEvent as any).setup === 'function' ? (userEvent as any).setup() : userEvent;

  return {
    ...render(ui, options),
    user,
  };
}
