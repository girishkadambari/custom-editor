import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from "lexical";

// Define the type for the serialized custom node
export type SerializedCustomeNode = Spread<
  {
    value: string;
    moreDetails?: object;
  },
  SerializedTextNode
>;

// Function to convert a DOM element to a custom node
function $convertCustomeElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const textContent = domNode.textContent;

  if (textContent !== null) {
    const node = $createCustomeNode(textContent);
    return {
      node,
    };
  }

  return null;
}

export class CustomeNode extends TextNode {
  __value: string;
  __moreDetails?: object;

  // Return the type of the node
  static getType(): string {
    return "custome-node";
  }

  // Clone the node
  static clone(node: CustomeNode): CustomeNode {
    return new CustomeNode(
      node.__value,
      node.__moreDetails,
      node.__text,
      node.__key
    );
  }

  // Import the serialized node
  static importJSON(serializedNode: SerializedCustomeNode): CustomeNode {
    const node = $createCustomeNode(
      serializedNode.value,
      serializedNode.moreDetails
    );
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(
    value: string,
    moreDetails?: object,
    text?: string,
    key?: NodeKey
  ) {
    super(text ?? value, key);
    this.__value = value;
    this.__moreDetails = moreDetails;
  }

  // Export the node to a serialized format
  exportJSON(): SerializedCustomeNode {
    return {
      ...super.exportJSON(),
      value: this.__value,
      moreDetails: this.__moreDetails,
      type: "custome-node",
      version: 1,
    };
  }

  // Create the DOM representation of the node
  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.textContent = `{${this.__value}}`;
    dom.className = " text-orange-500  font-normal ";
    return dom;
  }

  // Export the DOM representation of the node
  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-custome", "true");
    element.textContent = this.__text;
    return { element };
  }

  // Import the DOM conversion map for the node
  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-lexical-custome")) {
          return null;
        }
        return {
          conversion: $convertCustomeElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

// Helper function to create a new custom node
export function $createCustomeNode(
  value: string,
  moreDetails?: object
): CustomeNode {
  const customeNode = new CustomeNode(value, moreDetails);
  customeNode.setMode("normal").toggleDirectionless();
  return $applyNodeReplacement(customeNode);
}

// Helper function to check if a node is a custom node
export function $isCustomeNode(
  node: LexicalNode | null | undefined
): node is CustomeNode {
  return node instanceof CustomeNode;
}
