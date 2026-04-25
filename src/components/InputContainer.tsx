import { useMantineTheme, Flex, Text, alpha, Tooltip } from "@mantine/core";
import { MotionFlex } from "./Motion";
import { Variants } from "framer-motion";
import { colorWithAlpha } from "@/utils";
import { Info } from "lucide-react";

export type InputContainerProps = {
  title?:string;
  error?: string;
  description?:string;
  children?:React.ReactNode;
  w?:string | number;
  flex?:number | string;
  h?:string | number;
  bg?:string;
  p?:string | number;
  variants?: Variants;
  style?:React.CSSProperties;
  rightSection?:React.ReactNode;
}

export function InputContainer(props: InputContainerProps){
  const theme = useMantineTheme()
  return (
    <MotionFlex
      w={props.w || '100%'}
      flex={props.flex}
      direction='column'
      h={props.h}
      gap={props.title ? 'xs' : 0}
      

      bg={props.bg || alpha(theme.colors.dark[9], 0.65)}
      p={props.p || 'sm'}
      style={{
        borderRadius: theme.radius.xs,
        boxShadow: theme.shadows.sm,
        overflow: 'hidden',
        border: props.error ? `1px solid rgba(255, 100, 100, 0.8)` : '1px solid var(--mantine-color-dark-7)', 
        ...props.style,
      }}
      variants={props.variants}
    >

      <Flex
        align='center'
        gap='xs'
      >
        {(props.title || props.description) && (
          <Flex
            align='center'
            flex={1}
            p={props.p == '0' ? 'sm' : 0}
          >
            {props.title && (
              <Text
                size="sm"
                style={{
                  lineHeight: '1.25vh',
                  fontFamily: 'Akrobat Bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >{props.title}</Text>
            )}
            {props.description && (
              <Tooltip
                label={props.description}
                position="top-end"
                withArrow
                multiline
                maw="22vh"
                styles={{
                  tooltip: {
                    background: alpha(theme.colors.dark[7], 0.95),
                    border: `0.1vh solid rgba(255,255,255,0.1)`,
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Akrobat Bold',
                    fontSize: '1.3vh',
                    lineHeight: 1.3,
                    padding: '0.6vh 0.8vh',
                    letterSpacing: '0.03em',
                  },
                }}
              >
                <Flex align='center' justify='center' style={{ marginLeft: 'auto', cursor: 'help' }}>
                  <Info size="1.6vh" color={alpha(theme.colors[theme.primaryColor][5], 0.45)} />
                </Flex>
              </Tooltip>
            )}
          </Flex>
        )}
        {props.error && (
          <Text
            size='xs'
            c={theme.colors.red[9]}
            fw={600}
            mb='auto'
            lh='0.8'
          >
            {props.error}
          </Text>
        )}
        {props.rightSection && (
          <Flex>
            {props.rightSection}
          </Flex>
        )}
      </Flex>
      {props.children}            
    </MotionFlex>
  )
}