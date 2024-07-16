import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { $createCustomeNode } from "../nodes/CustomeNode";
import { useBasicTypeaheadTriggerMatch } from "../hook/useBasicTypeaheadTriggerMatch";

// Define the type for the custom data
type CustomData = {
  key: string;
  metadata: {
    id: string;
    name: string;
    url: string;
  };
};

// Sample custom data array
const customData: CustomData[] = [
  {
    key: "google_domain",
    metadata: { id: "1", name: "Google", url: "google.com" },
  },
  {
    key: "zomato_domain",
    metadata: { id: "2", name: "Zomato", url: "zomato.com" },
  },
];

// Class representing a typeahead option
class CustomTypeaheadOption extends MenuOption {
  key: string;
  metadata: {
    id: string;
    name: string;
    url: string;
  };

  constructor(
    key: string,
    metadata: { id: string; name: string; url: string }
  ) {
    super(key);
    this.key = key;
    this.metadata = metadata;
  }
}

// Suggestion item component
export function SuggestionItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: CustomTypeaheadOption;
}): JSX.Element {
  let className =
    "cursor-pointer bg-slate-50 text-unique-600 hover:bg-secondary-50 py-2 px-3 text-xs flex items-center";
  if (isSelected) {
    className += " bg-slate-200";
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className="popper__reference">{option.metadata.name}</span>
    </li>
  );
}

// Custom data suggestion plugin component
export default function CustomDataSuggestionPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [showCustomDataSuggestions, setShowCustomDataSuggestions] =
    useState(true);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("{", {
    minLength: 0,
  });

  const checkForCustomDataTriggerMatch = useCallback(
    (text: string) => {
      const match = checkForTriggerMatch(text, editor);
      if (match !== null) {
        setShowCustomDataSuggestions(true);
      }
      return match;
    },
    [checkForTriggerMatch, editor]
  );

  const onSelectOption = useCallback(
    (
      selectedOption: CustomTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const customNode = $createCustomeNode(
          selectedOption.key,
          selectedOption.metadata
        );
        if (nodeToReplace) {
          nodeToReplace.replace(customNode);
        }
        customNode.select();
        closeMenu();
      });
    },
    [editor]
  );

  const createFilteredOptions = (
    options: CustomData[],
    queryString: string | RegExp | null
  ) => {
    if (queryString === null) {
      return options.slice(0, 10);
    }

    const regex = new RegExp(queryString, "gi");
    return options.filter((option) => regex.test(option.key)).slice(0, 10);
  };

  const options: CustomTypeaheadOption[] = useMemo(
    () =>
      createFilteredOptions(customData, queryString).map(
        (data) => new CustomTypeaheadOption(data.key, data.metadata)
      ),
    [customData, queryString]
  );

  const renderSuggestionsMenu = (
    anchorElementRef: { current: Element | DocumentFragment | null },
    { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }: any
  ) => {
    if (
      !showCustomDataSuggestions ||
      anchorElementRef.current == null ||
      options.length === 0
    ) {
      return null;
    }
    return anchorElementRef.current && options.length
      ? createPortal(
          <div className="bg-white rounded overflow-hidden shadow-md gap-0.5 max-h-[320px] overflow-y-auto w-[180px] min-w-[90px]">
            <ul>
              {options.map((option: CustomTypeaheadOption, index: number) => (
                <SuggestionItem
                  index={index}
                  isSelected={selectedIndex === index}
                  onClick={() => {
                    setHighlightedIndex(index);
                    selectOptionAndCleanUp(option);
                  }}
                  onMouseEnter={() => {
                    setHighlightedIndex(index);
                  }}
                  option={option}
                />
              ))}
            </ul>
          </div>,
          anchorElementRef.current
        )
      : null;
  };

  return (
    <LexicalTypeaheadMenuPlugin<CustomTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForCustomDataTriggerMatch}
      options={options}
      anchorClassName="z-[10000]"
      menuRenderFn={renderSuggestionsMenu}
    />
  );
}
