export interface DialogAction {
  readonly label: string;
  readonly onPress: () => void;
  readonly highlight?: boolean;
}
