// Skeletons of Mana's own screens, in the 497×1024 points of an iPhone screenshot. Every
// class is a theme color (see ThemeScreen.vue), so one drawing previews every theme.

export interface Shape {
  tag: 'rect' | 'circle'
  attrs: Record<string, string | number>
}

export interface Screen {
  id: string
  title: string
  shapes: Shape[]
}

const box = (x: number, y: number, width: number, height: number, cls: string, rx = 0): Shape =>
  ({ tag: 'rect', attrs: { x, y, width, height, rx, class: cls } })

const dot = (cx: number, cy: number, r: number, cls: string): Shape =>
  ({ tag: 'circle', attrs: { cx, cy, r, class: cls } })

const bar = (x: number, y: number, width: number, height: number, cls = 'label') =>
  box(x, y, width, height, cls, height / 2)

const line = (x: number, y: number, width: number) => box(x, y, width, 1, 'separator')

// A capsule with its text as a bar, centered.
function pill(x: number, y: number, width: number, height: number, cls = 'chip', text = 'muted') {
  const inner = width * 0.6
  return [box(x, y, width, height, cls, height / 2), bar(x + (width - inner) / 2, y + height / 2 - 5, inner, 10, text)]
}

const iconButton = (cx: number, cy: number) => [dot(cx, cy, 24, 'raised'), dot(cx, cy, 8, 'label')]

const tabBar = (active: number) => {
  const centers = [75, 162, 248, 334, 420]
  return [
    box(24, 930, 448, 70, 'glass', 35),
    box(centers[active] - 47, 936, 94, 58, 'tertiary', 29),
    ...centers.flatMap((x, i) => {
      const cls = i === active ? 'accent' : 'label'
      return [dot(x, 956, 11, cls), bar(x - 21, 977, 42, 8, cls)]
    })
  ]
}

const searchField = (trailing: Shape[] = []) => [
  box(23, 135, 451, 48, 'secondary', 24),
  dot(47, 159, 8, 'label'),
  bar(68, 153, 122, 13, 'muted'),
  ...trailing
]

const cover = (x: number, y: number, width: number, height: number, cls: string, rx: number) =>
  [box(x, y, width, height, cls, rx), box(x, y, width, height, 'scrim', rx)]

function libraryTile(x: number, y: number, i: number) {
  return [
    ...cover(x, y, 146, 218, i % 2 ? 'secondary' : 'tertiary', 12),
    box(x + 118, y + 6, 24, 22, 'accent', 6),
    bar(x + 10, y + 178, 122, 11),
    bar(x + 10, y + 197, 90, 11)
  ]
}

const content: Shape[] = [
  box(0, 0, 497, 400, 'tertiary'),
  box(0, 180, 497, 220, 'fade'),
  ...iconButton(46, 46),
  bar(32, 328, 430, 24),
  bar(117, 360, 260, 24),

  box(22, 407, 79, 31, 'info-chip', 15.5),
  bar(36, 417, 51, 10, 'info'),
  ...[[107, 76], [189, 58], [253, 66], [325, 82], [413, 100]].flatMap(([x, w]) => pill(x, 407, w, 31)),

  bar(96, 462, 72, 15),
  bar(335, 462, 52, 15, 'muted'),
  line(18, 494, 458),
  box(18, 491, 228, 3, 'accent'),

  box(22, 513, 450, 530, 'card', 28),
  bar(41, 531, 86, 13, 'muted'),
  bar(431, 532, 18, 2),
  bar(433, 537, 14, 2),
  bar(436, 542, 8, 2),
  ...[0, 1, 2, 3, 4, 5, 6].flatMap((i) => {
    const y = 581 + i * 69
    return [bar(61, y, 90, 15), box(61, y + 24, 14, 10, 'muted', 2), bar(78, y + 23, 60, 11, 'muted'), line(45, y + 51, 404)]
  }),

  box(22, 937, 389, 49, 'accent', 24.5),
  bar(133, 954, 168, 15, 'on-accent'),
  dot(447, 961, 25, 'raised'),
  box(441, 951, 12, 20, 'label', 2),
  bar(159, 1010, 176, 5)
]

const library: Shape[] = [
  box(294, 15, 180, 48, 'raised', 24),
  ...[320, 382, 446].map(x => dot(x, 39, 12, 'label')),
  box(374, 12, 36, 18, 'destructive', 9),

  bar(23, 88, 125, 30),
  ...searchField(),

  ...pill(18, 196, 71, 38),
  ...pill(97, 196, 112, 38),
  ...pill(225, 196, 142, 38, 'accent', 'on-accent'),
  ...pill(377, 196, 120, 38),

  ...[0, 1, 2, 3].flatMap(row => [18, 175, 331].flatMap((x, column) =>
    libraryTile(x, 247 + row * 230, row + column))),

  ...[328, 390, 453].flatMap(x => iconButton(x, 884)),
  ...tabBar(0)
]

const discover: Shape[] = [
  box(0, 0, 497, 720, 'secondary'),
  box(0, 300, 497, 420, 'fade'),

  ...iconButton(47, 40),
  bar(196, 31, 106, 18),
  box(354, 15, 120, 50, 'raised', 25),
  dot(382, 40, 12, 'label'),
  dot(446, 40, 12, 'label'),

  ...cover(-15, 215, 47, 370, 'tertiary', 12),
  ...cover(465, 215, 47, 370, 'tertiary', 12),
  ...cover(50, 114, 397, 570, 'tertiary', 16),
  box(61, 124, 55, 28, 'overlay', 14),
  dot(76, 138, 6, 'accent'),
  bar(87, 133, 21, 10),
  bar(99, 604, 300, 20),
  bar(201, 633, 96, 14, 'muted'),

  bar(18, 772, 158, 20),
  dot(190, 782, 8, 'accent'),
  bar(18, 811, 270, 12, 'muted'),

  box(18, 838, 461, 180, 'secondary', 12),
  box(29, 850, 103, 150, 'tertiary', 6),
  bar(145, 853, 315, 18),
  bar(145, 884, 88, 13, 'muted'),
  bar(365, 884, 100, 13, 'muted'),
  bar(145, 908, 88, 13, 'muted'),
  bar(365, 908, 100, 13, 'muted'),

  ...tabBar(1)
]

const settingRow = (y: number, width: number) => bar(45, y, width, 15)
const stepper = (y: number) => [
  box(347, y, 105, 36, 'tertiary', 18),
  box(398, y + 8, 1, 20, 'separator'),
  dot(372, y + 18, 6, 'muted'),
  dot(425, y + 18, 6, 'label')
]

const search: Shape[] = [
  ...iconButton(47, 40),
  ...pill(376, 15, 98, 50, 'accent', 'on-accent'),

  bar(23, 88, 150, 30),
  ...searchField([dot(444, 159, 11, 'label')]),

  bar(45, 210, 100, 12, 'muted'),
  box(23, 236, 451, 117, 'secondary', 22),
  settingRow(258, 56),
  dot(441, 265, 8, 'muted'),
  line(45, 294, 407),
  settingRow(317, 36),
  dot(441, 324, 10, 'accent'),

  bar(34, 388, 34, 12, 'muted'),
  ...[[23, 70], [101, 82], [191, 76], [275, 56]].flatMap(([x, w]) => pill(x, 422, w, 32)),

  bar(34, 487, 44, 12, 'muted'),
  ...[[23, 81], [113, 101], [222, 69], [299, 89]].flatMap(([x, w]) => pill(x, 521, w, 32)),

  bar(45, 585, 80, 12, 'muted'),
  box(23, 611, 451, 176, 'secondary', 22),
  settingRow(633, 98),
  bar(302, 635, 34, 12, 'muted'),
  ...stepper(623),
  line(45, 669, 407),
  settingRow(692, 142),
  bar(324, 694, 12, 12, 'muted'),
  ...stepper(682),
  line(45, 728, 407),
  settingRow(751, 186),
  box(381, 742, 71, 32, 'tertiary', 16),
  box(383, 744, 44, 28, 'label', 14),

  bar(45, 821, 34, 12, 'muted'),
  box(23, 847, 451, 59, 'secondary', 22),
  settingRow(869, 36),
  box(324, 862, 128, 29, 'accent-soft', 14.5),
  bar(352, 871, 72, 11, 'accent'),

  ...tabBar(2)
]

export const screens: Screen[] = [
  { id: 'library', title: 'Library', shapes: library },
  { id: 'discover', title: 'Discover', shapes: discover },
  { id: 'content', title: 'Title page', shapes: content },
  { id: 'search', title: 'Search', shapes: search }
]
