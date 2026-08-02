export interface DialogAction {
  readonly label: string;
  readonly onPress: () => void;
  /** Renders the label in the error colour, for destructive choices. */
  readonly highlight?: boolean;
}
