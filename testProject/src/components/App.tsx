import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Flex, MultiSelect, NumberInput, Text, TextInput } from "@mantine/core";
import { createSkill, DirkProvider, InputContainer, ModalProvider, MotionFlex, Title, TornEdgeSVGFilter, useModalActions, useNuiEvent, useSettings, useTornEdges } from "dirk-cfx-react";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { useFastTravel } from "./useFastTravel";
import TestButton from "./TestButton";
import { Notification } from "@mantine/core";


export const {skill: drugSkill, useSkill: useDrugSkill} = createSkill({
  baseLevel: 1,
  maxLevel: 99,
  baseXP: 83,
  modifier: 1,
});

const App: React.FC = () => {
  const open = useFastTravel((state) => state.open);
  useNuiEvent('CLOSE_FAST_TRAVEL', () => {
    useFastTravel.setState({ open: false });
  });

  useNuiEvent('OPEN_FAST_TRAVEL', () => {
    useFastTravel.setState({ open: true });
  });
  const game = useSettings((data) => data.game);
  // useSettings.setState({ primaryColor: 'red', game: 'fivem' });
  const tornEdgeCSS = useTornEdges();
 
  const { nextLevelXP } = useDrugSkill(0);
  return (
    <DirkProvider>
      <Notification/>
      <TornEdgeSVGFilter />
      <ModalProvider>
        <AnimatePresence>
          {open && (
            <MotionFlex
              className={tornEdgeCSS}
              direction="column"
              w='115vh'
              h='65vh'
              bg='rgba(0,0,0,0.9)'
              pos='absolute'
              left='50%'
              top='50%'
              style={{ 
                transform: 'translate(-50%, -50%)',
                borderRadius: 'var(--mantine-radius-xs)',
              }}
              align="center"
            >
              {/* {nextLevelXP} */}
              <Title 
                p='sm'
                icon='car'
                bg='rgba(0,0,0,0.5)'
                title='Fast Travel'
                description="Fast Travel"
                rightSection={
                  <Text>hi</Text>
                }
              />
              {/* <Grid /> */}
              <Flex
                w='100%'
                p='sm'
              >
              <InputContainer
                title='test'
              >
                <TextInput  
                  placeholder="Test Input"
                  label="Test Label"
                  description="This is a description for the input field."
                  variant="filled"
                  w='100%'
                  leftSection={
                    <FontAwesomeIcon icon="user" />
                  }
                />
                <NumberInput  
                  placeholder="Test Number Input"
                  label="Test Number Label"
                  description="This is a description for the number input field."
                  variant="filled"

                  w='100%'
                />
                <MultiSelect
                  label="Test MultiSelect Label"
                  description="This is a description for the multi select field."
                  data={['Option 1', 'Option 2', 'Option 3']}
                  placeholder="Test MultiSelect"
                  variant="filled"
                  defaultValue={['Option 1']}
                />
                <TestButton />
                <Title
                  icon="plane"
                  title="Fast Travel Title"
                  description="Description for fast travel title."
                />
              </InputContainer>
              </Flex>
            </MotionFlex>
          )}
        </AnimatePresence>
      </ModalProvider>
    </DirkProvider>
  );
};

export default App;






