import { Editor, EditorState, convertToRaw, RichUtils } from "draft-js";
import { useEffect, useRef, useState } from "react";
import "draft-js/dist/Draft.css";

const TextEditor = (props) => {
  const [editorState, setEditorState] = useState(props.editorState || EditorState.createEmpty());
  const [editorData, setEditorData] = useState();

  const editor = useRef();

  useEffect(() => {
    if (editorData) {
      handleSend();
    }
    focusEditor();
  }, [editorData]);

  const handleSend = () => {
    if (props.setEditorOutput) {
      props.setEditorOutput(editorData);
    } else if (props.sendToParent) {
      props.sendToParent(editorData);
    }
  };

  const focusEditor = () => {
    editor.current.focus();
  };

  const onBlockClick = (e) => {
    let nextState = RichUtils.toggleBlockType(editorState, e);
    setEditorState(nextState);
  };

  const StyleButton = (props) => {
    let onClickButton = (e) => {
      e.preventDefault();
      props.onToggle(props.style);
    };

    return (
      <span
        onMouseDown={onClickButton}
        style={{
          marginRight: "16px",
          cursor: "pointer",
          color: "#3880ff",
          fontWeight: 500,
        }}
      >
        {props.label}
      </span>
    );
  };

  const BLOCK_TYPES = [
    { label: "قائمة غير مرتبة", style: "unordered-list-item" },
    { label: "قائمة مرتبة", style: "ordered-list-item" },
  ];

  const BlockStyleControls = (props) => {
    return (
      <div>
        {BLOCK_TYPES.map((type) => {
          return (
            <StyleButton
              key={type.label}
              label={type.label}
              style={type.style}
              onToggle={props.onToggle}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      onClick={focusEditor}
      style={{
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "4px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        margin: "16px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          padding: "8px 16px",
          backgroundColor: "#f8f8f8",
        }}
      >
        <BlockStyleControls onToggle={onBlockClick} />
      </div>
      <div
        style={{
          padding: "16px",
          minHeight: "150px",
        }}
      >
        <Editor
          ref={editor}
          editorState={editorState}
          onChange={(editorState) => {
            setEditorState(editorState);
            setEditorData(
              JSON.stringify(convertToRaw(editorState.getCurrentContent()))
            );
          }}
        />
      </div>
    </div>
  );
};

export default TextEditor;
