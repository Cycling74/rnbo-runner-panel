import { useMediaQuery } from "@mantine/hooks";

export const useIsMobileDevice = () => useMediaQuery("(max-width: 62em)");
