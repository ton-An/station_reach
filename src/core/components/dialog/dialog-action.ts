/** One button in a {@link Dialog}'s action row. */
export interface DialogAction {
  readonly label: string;
  readonly onPress: () => void;
  /** Renders the label in the error colour, marking a destructive action. */
  readonly highlight?: boolean;
}
