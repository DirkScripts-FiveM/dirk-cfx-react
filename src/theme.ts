import { alpha, ColorInput, createTheme, MantineTheme, MultiSelect, NumberInput, TextInput } from "@mantine/core";

export const label = {
  fontSize: 'var(--mantine-font-size-xs)',
  fontFamily: 'Akrobat Bold',
  letterSpacing: '0.05em',
  textTransform: 'uppercase', 
};
export const error = {
  fontSize: 'var(--mantine-font-size-xs)',
  fontFamily: 'Akrobat Regular',
};
export const description = {
  fontSize: 'var(--mantine-font-size-xs)',
};

export const genericInputStyles = {
  styles: {
    label: label,
    error: error,
    description: description,
    
    input:{
      background: 'rgba(255,255,255,0.04)',
      border: '0.1vh solid rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.85)',
      minHeight: '4vh',
    },
  },
};

const theme = createTheme({
  primaryColor: "dirk",
  primaryShade: 9,
  defaultRadius: "xs",
  fontFamily: "Akrobat Regular, sans-serif",

  radius:{
    xxs: '0.3vh',
    xs: '0.5vh',
    sm: '0.75vh',
    md: '1vh',
    lg: '1.5vh',
    xl: '2vh',
    xxl: '3vh',
  },

  fontSizes: {
    xxs: '1.2vh',
    xs: '1.5vh',
    sm: '1.8vh',
    md: '2.2vh',
    lg: '2.8vh',
    xl: '3.3vh',
    xxl: '3.8vh',
  },

  lineHeights: {
    xxs: '1.4vh',
    xs: '1.8vh',
    sm: '2.2vh',
    md: '2.8vh',
    lg: '3.3vh',
    xl: '3.8vh',
  },

  spacing:{
    xxs: '0.5vh',
    xs: '0.75vh',
    sm: '1.5vh',
    md: '2vh',
    lg: '3vh',
    xl: '4vh',
    xxl: '5vh',
  },

  components:{
    Progress:{
      styles:{
        label: {
          fontFamily: 'Akrobat Bold',
          letterSpacing: '0.05em',
          textTransform: 'uppercase', 
        },

        root:{
          backgroundColor: 'rgba(77, 77, 77, 0.4)',
        },
        
      }
    },
    
    
    Input:  genericInputStyles,
    TextInput: genericInputStyles,
    NumberInput: genericInputStyles,
    Select: genericInputStyles,
    MultiSelect:  genericInputStyles,
    Textarea: genericInputStyles,
    ColorInput: genericInputStyles,
    DateInput: genericInputStyles,

    // Mantine's <Button> defaults to rem-based heights (xs ≈ 1.875rem)
    // which doesn't match this theme's vh-based input min-heights, so
    // `<Button size="xs">` rendered next to `<TextInput size="xs">` ends
    // up visibly shorter. Pin the button heights to the same vh values
    // the inputs use so xs-everything lines up out of the box.
    Button: {
      styles: {
        label: {
          fontFamily: 'Akrobat Bold',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        },
        root: {
          // Mantine maps these to --button-height per size; setting them
          // directly here keeps native Button sizing logic intact.
        },
      },
      vars: (_theme: MantineTheme, props: { size?: string }) => {
        const heights: Record<string, string> = {
          xs: '4vh',
          sm: '4.5vh',
          md: '5vh',
          lg: '5.5vh',
          xl: '6vh',
        };
        const h = heights[props.size ?? 'sm'] ?? '4.5vh';
        return {
          root: {
            '--button-height': h,
          },
        };
      },
    },

    Pill: {
      styles: (theme: MantineTheme) => ({
        root: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(76, 76, 76, 0.3)',
          height: 'fit-content',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontFamily: 'Akrobat Bold',
          fontSize: '1.25vh',
          borderRadius: theme.defaultRadius,
          paddingBottom: '0.5vh',
          paddingTop: '0.5vh',
        }
      })
    },

    // Mantine's <Tooltip> defaults to a white card with black text — looks
    // jarring against every dirk consumer's dark configurator. Every script
    // used to hand-paste this dark style block per Tooltip; centralised here
    // so consumers get the right look automatically and never need to think
    // about it again.
    Tooltip: {
      styles: (theme: MantineTheme) => ({
        tooltip: {
          background: alpha(theme.colors.dark[7], 0.95),
          border: '0.1vh solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.75)',
          fontFamily: 'Akrobat Bold',
          fontSize: '1.3vh',
          lineHeight: 1.3,
          padding: '0.6vh 0.8vh',
          letterSpacing: '0.03em',
        },
      }),
    },

  },

  colors: {

    dirk:[
      "#ffffff",
      "#f3fce9",
      "#dbf5bd",
      "#c3ee91",
      "#ace765",
      "#94e039",
      "#7ac61f",
      "#5f9a18",
      "#29420a",
      "#446e11",
    ],
  },
});


export default theme;