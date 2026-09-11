import type { SvgProps } from 'react-native-svg';

import Bus from '@/assets/icons/bus.svg';
import CableCar from '@/assets/icons/cable_car.svg';
import ChevronLeft from '@/assets/icons/chevron_left.svg';
import ChevronRight from '@/assets/icons/chevron_right.svg';
import CircleQuestionMark from '@/assets/icons/circle_question_mark.svg';
import Coach from '@/assets/icons/coach.svg';
import Funicular from '@/assets/icons/funicular.svg';
import Github from '@/assets/icons/github.svg';
import HighspeedRail from '@/assets/icons/highspeed_rail.svg';
import Info from '@/assets/icons/info.svg';
import MapPin from '@/assets/icons/map_pin.svg';
import NightTrain from '@/assets/icons/night_train.svg';
import Search from '@/assets/icons/search.svg';
import Ship from '@/assets/icons/ship.svg';
import Subway from '@/assets/icons/subway.svg';
import Train from '@/assets/icons/train.svg';
import Tram from '@/assets/icons/tram.svg';
import TriangleAlert from '@/assets/icons/triangle_alert.svg';

const Icons = {
  bus: Bus,
  cableCar: CableCar,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  circleQuestionMark: CircleQuestionMark,
  coach: Coach,
  funicular: Funicular,
  github: Github,
  highspeedRail: HighspeedRail,
  info: Info,
  mapPin: MapPin,
  nightTrain: NightTrain,
  search: Search,
  ship: Ship,
  subway: Subway,
  train: Train,
  tram: Tram,
  triangleAlert: TriangleAlert,
} as const;

export type IconName = keyof typeof Icons;

interface IconProps {
  readonly name: IconName;
  readonly size: number;
  readonly color: string;
}

export function Icon({ name, size, color }: IconProps): React.JSX.Element {
  const Glyph: React.FC<SvgProps> = Icons[name];

  return <Glyph width={size} height={size} color={color} />;
}
