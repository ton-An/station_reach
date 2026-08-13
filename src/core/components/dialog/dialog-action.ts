/** One button in a dialog's action row. */
export interface DialogAction {
  readonly label: string;
  readonly onPress: () => void;
  /** Draws the label in the error colour. */
  readonly highlight?: boolean;
}
