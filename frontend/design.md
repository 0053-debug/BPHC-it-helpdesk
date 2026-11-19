# I-ITSM Console design system

## Direction

The shared React client uses the Console visual system across the public landing page, browser workspace, desktop wrapper, and mobile wrappers. The interface uses graphite surfaces, warm amber for primary actions, cool blue for system information, and restrained status colors. It keeps the BPHC IT HelpDesk identity and version 1.1.

## Layout

- Public content uses a centered 1,440 px container, section rules, and short feature rows.
- The workspace uses a sticky identity header, role-aware tab navigation, a centered content column, and task sections with clear headings.
- Ticket work is organized around issue reporting, filters, ticket selection, ticket details, and updates.
- Large data views scroll horizontally when needed; navigation tabs remain horizontally scrollable on small screens.
- Cards use a 10 px radius, controls use 6 px, and small status chips use 4 px.

## Type and color

- Host Grotesk Variable is used for interface text and headings.
- Atkinson Hyperlegible Mono Variable is reserved for identifiers, codes, and measured values.
- Text and surfaces use the graphite tokens in `src/styles/tokens.css`.
- Amber marks the active person or primary action; cool blue marks system information; green and red mark successful and failed states.
- Interactive controls have visible focus, disabled states, and reduced-motion support.

## Navigation and interactions

- Console navigation uses accessible tabs with URL state and browser history support.
- The public download selector uses accessible tabs for Windows, Android, and web access. Each original release and console destination remains connected.
- Notifications, service selection, technician availability, ticket actions, and the Desk Buddy ticket guide retain their existing API calls and role restrictions.
- Keyboard users can move through both tab lists with the arrow keys, Home, and End.

## Breakpoints

- At 700 px and below, page headers stack, the public hero and auth layout use one column, and download details stack above their action.
- At 400 px and below, controls and navigation compress while remaining visible and operable.
