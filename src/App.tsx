import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";

import ExampleTheme from "./ExampleTheme";
import { CustomeNode } from "./nodes/CustomeNode";
import CustomeDataSuggestionPlugin from "./plugins/CustomDataPlguin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import "./index.css";

function Placeholder() {
  return <div className="editor-placeholder">{"Enter { for suggestion.."}</div>;
}

const editorConfig = {
  namespace: "Custome Data Suggestions",
  nodes: [CustomeNode],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

export default function App() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <div className="editor-inner">
          <PlainTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <CustomeDataSuggestionPlugin />
          <TreeViewPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
