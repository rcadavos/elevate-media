type AdminChromeBrandProps = {
  /** Shown before “Portal”, e.g. Admin → “Admin Portal”. */
  roleLabel?: string;
};

/**
 * Admin chrome: product name, then “{role} Portal”. Sits in the left column of
 * the top row so its bottom edge lines up with the shared border under the top navbar.
 */
export function AdminChromeBrand({ roleLabel = "Admin" }: AdminChromeBrandProps) {
  return (
    <div className="flex h-full min-h-[3.25rem] flex-col justify-center gap-1 px-4 py-3">
      <p className="text-[10px] font-semibold tracking-widest text-primary">
        elev8temedia
      </p>
      <p className="text-base font-semibold leading-none text-foreground">
        {roleLabel} Portal
      </p>
    </div>
  );
}
