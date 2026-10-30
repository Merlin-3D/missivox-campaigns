import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'campaigns/create': ExtractProps<(typeof import('../../inertia/pages/campaigns/create.tsx'))['default']>
    'campaigns/edit': ExtractProps<(typeof import('../../inertia/pages/campaigns/edit.tsx'))['default']>
    'campaigns/index': ExtractProps<(typeof import('../../inertia/pages/campaigns/index.tsx'))['default']>
    'campaigns/show': ExtractProps<(typeof import('../../inertia/pages/campaigns/show.tsx'))['default']>
    'contacts/form': ExtractProps<(typeof import('../../inertia/pages/contacts/form.tsx'))['default']>
    'contacts/import': ExtractProps<(typeof import('../../inertia/pages/contacts/import.tsx'))['default']>
    'contacts/index': ExtractProps<(typeof import('../../inertia/pages/contacts/index.tsx'))['default']>
    'contacts/show': ExtractProps<(typeof import('../../inertia/pages/contacts/show.tsx'))['default']>
    'dashboard': ExtractProps<(typeof import('../../inertia/pages/dashboard.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'lists/index': ExtractProps<(typeof import('../../inertia/pages/lists/index.tsx'))['default']>
    'public/message': ExtractProps<(typeof import('../../inertia/pages/public/message.tsx'))['default']>
    'public/unsubscribe': ExtractProps<(typeof import('../../inertia/pages/public/unsubscribe.tsx'))['default']>
    'settings/general': ExtractProps<(typeof import('../../inertia/pages/settings/general.tsx'))['default']>
    'settings/team': ExtractProps<(typeof import('../../inertia/pages/settings/team.tsx'))['default']>
    'templates/form': ExtractProps<(typeof import('../../inertia/pages/templates/form.tsx'))['default']>
    'templates/index': ExtractProps<(typeof import('../../inertia/pages/templates/index.tsx'))['default']>
  }
}
