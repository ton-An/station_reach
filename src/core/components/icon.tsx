import type { SvgProps } from 'react-native-svg';

import ArrowBack from '@/assets/icons/arrow_back_ios_new.svg';
import ArrowForward from '@/assets/icons/arrow_forward_ios.svg';
import Coach from '@/assets/icons/coach.svg';
import DirectionsBoat from '@/assets/icons/directions_boat.svg';
import DirectionsBus from '@/assets/icons/directions_bus.svg';
import Funicular from '@/assets/icons/funicular.svg';
import Github from '@/assets/icons/github.svg';
import Info from '@/assets/icons/info.svg';
import LocationOn from '@/assets/icons/location_on.svg';
import NightTrain from '@/assets/icons/night_train.svg';
import QuestionMark from '@/assets/icons/question_mark.svg';
import Search from '@/assets/icons/search.svg';
import Subway from '@/assets/icons/subway.svg';
import Train from '@/assets/icons/train.svg';
import Tram from '@/assets/icons/tram.svg';
import Warning from '@/assets/icons/warning.svg';

/*
  Every glyph is a vendored SVG rather than an icon font.

  The Flutter app drew from Material Symbols (mostly the Rounded optical
  variant), which no React Native icon package ships — `@expo/vector-icons`
  only carries the older Material Icons, whose shapes visibly differ. These are
  the exact same source glyphs, normalised to `currentColor` so the `color`
  prop tints them the way Flutter's `ColorFilter.srcIn` did.
*/

const Icons = {
  arrowBack: ArrowBack,
  arrowForward: ArrowForward,
  coach: Coach,
  directionsBoat: DirectionsBoat,
  directionsBus: DirectionsBus,
  funicular: Funicular,
  github: Github,
  info: Info,
  locationOn: LocationOn,
  nightTrain: NightTrain,
  questionMark: QuestionMark,
  search: Search,
  subway: Subway,
  train: Train,
  tram: Tram,
  warning: Warning,
} as const;

export type IconName = keyof typeof Icons;

interface IconProps {
  readonly name: IconName;
  readonly size: number;
  readonly color: string;
}

/** A single glyph, sized and tinted. */
export function Icon({ name, size, color }: IconProps) {
  const Glyph: React.FC<SvgProps> = Icons[name];

  return <Glyph width={size} height={size} color={color} />;
}
