# ANSI Start Codes

ESC="\e"

# Styles.
Normal="${ESC}[0m"
Bold="${ESC}[1m"
Faint="${ESC}[2m"
Italic="${ESC}[3m"
Underline="${ESC}[4m"
Blink_Slow="${ESC}[5m"
Blink_Rapid="${ESC}[6m"
Inverse="${ESC}[7m"
Conceal="${ESC}[8m"
Crossed_Out="${ESC}[9m"
# Text colors.
Black="${ESC}[30m"
Red="${ESC}[31m"
Green="${ESC}[32m"
Yellow="${ESC}[33m"
Blue="${ESC}[34m"
Magenta="${ESC}[35m"
Cyan="${ESC}[36m"
White="${ESC}[37m"
# Background colors.
Bg_Black="${ESC}[40m"
Bg_Red="${ESC}[41m"
Bg_Green="${ESC}[42m"
Bg_Yellow="${ESC}[43m"
Bg_Blue="${ESC}[44m"
Bg_Magenta="${ESC}[45m"
Bg_Cyan="${ESC}[46m"
Bg_White="${ESC}[47m"
# Resets
NoStyle="${ESC}[0m"
NoUnderline="${ESC}[24m"
NoInverse="${ESC}[27m"
NoColor="${ESC}[39m"

Colors1="None $Black""Black""$NoColor $Red""Red""$NoColor $Green""Green""$NoColor $Yellow""Yellow""$NoColor"
Colors2="$Blue""Blue""$NoColor $Magenta""Magenta""$NoColor $Cyan""Cyan""$NoColor $White""White""$NoColor"
AllColors="$Colors1 $Colors2 $NoStyle"

Bg_Black_All="$Bg_Black$AllColors"
Bg_Red_All="$Bg_Red$AllColors"
Bg_Green_All="$Bg_Green$AllColors"
Bg_Yellow_All="$Bg_Yellow$AllColors"
Bg_Blue_All="$Bg_Blue$AllColors"
Bg_Magenta_All="$Bg_Magenta$AllColors"
Bg_Cyan_All="$Bg_Cyan$AllColors"
Bg_White_All="$Bg_White$AllColors"

# Test Table
echo -e "Background: | Style:      | Text Colors:"
echo -e "------------|-------------|----------------------------------------------------"
echo -e "            | Normal      | "$Normal$AllColors
echo -e "            | Bold        | "$Bold$AllColors
echo -e "            | Faint       | "$Faint$AllColors
echo -e "            | Italic      | "$Italic$AllColors
echo -e "            | Underline   | "$Underline$AllColors
echo -e "            | Blink_Slow  | "$Blink_Slow$AllColors
echo -e "            | Blink_Rapid | "$Blink_Rapid$AllColors
echo -e "            | Inverse     | "$Inverse$AllColors
echo -e "            | Conceal     | "$Conceal$AllColors
echo -e "            | Crossed_Out | "$Crossed_Out$AllColors
echo -e "BG Black    | Normal      | "$Normal$Bg_Black_All
echo -e "BG Red      | Normal      | "$Normal$Bg_Red_All
echo -e "BG Green    | Normal      | "$Normal$Bg_Green_All
echo -e "BG Yellow   | Normal      | "$Normal$Bg_Yellow_All
echo -e "BG Blue     | Normal      | "$Normal$Bg_Blue_All
echo -e "BG Magenta  | Normal      | "$Normal$Bg_Magenta_All
echo -e "BG Cyan     | Normal      | "$Normal$Bg_Cyan_All
echo -e "BG White    | Normal      | "$Normal$Bg_White_All
