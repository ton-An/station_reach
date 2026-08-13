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

/*
  Every glyph is a vendored SVG rather than an icon font.

  The set is Lucide: 24×24, `stroke-width` 2, round caps and joins, drawn as
  strokes rather than filled shapes. That is the load-bearing part — a filled
  glyph dropped in beside these reads as bold, not as a different icon — so
  anything added later has to be built on that grid at that weight, and the
  attributes stay on the root so a file cannot drift.

  `stroke` is `currentColor` and there is no `fill`, so the `color` prop is the
  only source of tint. No `<style>` and no `class`: react-native-svg applies
  neither, and a glyph that colours itself through CSS renders black on device
  while looking correct on the web.
*/

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

/** A single glyph, sized and tinted. */
export function Icon({ name, size, color }: IconProps): React.JSX.Element {
  const Glyph: React.FC<SvgProps> = Icons[name];

  return <Glyph width={size} height={size} color={color} />;
}
