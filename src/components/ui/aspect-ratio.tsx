type AspectRatioProps = JSX.IntrinsicElements["div"] & {
  ratio?: number;
};

function AspectRatio({
  ratio = 1,
  style,
  ...props
}: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(ratio),
        ...(typeof style === "object" && style !== null ? style : {}),
      }}
      {...props}
    />
  );
}

export { AspectRatio };
export type { AspectRatioProps };
