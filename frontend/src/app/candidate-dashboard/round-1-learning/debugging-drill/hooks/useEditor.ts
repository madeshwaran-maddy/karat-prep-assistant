"use client";

import { useCallback, useRef } from "react";


export function useEditor() {

  const editorRef = useRef<any>(null);

  const monacoRef = useRef<any>(null);


  /**
   * Called when Monaco editor mounts
   */
  const handleEditorMount = useCallback(
    (
      editor: any,
      monaco: any
    ) => {

      editorRef.current = editor;

      monacoRef.current = monaco;


      editor.focus();


      editor.updateOptions({

        fontSize: 15,

        minimap: {
          enabled: false,
        },

        automaticLayout: true,

        tabSize: 4,

        insertSpaces: true,

        wordWrap: "on",

        formatOnPaste: true,

        formatOnType: true,

        scrollBeyondLastLine: false,

      });


    },
    []
  );



  /**
   * Get current editor value
   */
  const getValue = useCallback(
    (): string => {

      if (!editorRef.current) {

        return "";

      }


      return editorRef.current
        .getValue();

    },
    []
  );



  /**
   * Set editor value
   */
  const setValue = useCallback(
    (
      value:string
    ) => {


      if (!editorRef.current) {

        return;

      }


      editorRef.current
        .setValue(value);


    },
    []
  );



  /**
   * Focus editor
   */
  const focus = useCallback(
    () => {


      editorRef.current
        ?.focus();


    },
    []
  );



  /**
   * Format Java code
   */
  const formatCode = useCallback(
    async () => {


      if (!editorRef.current) {

        return;

      }


      await editorRef.current
        .getAction(
          "editor.action.formatDocument"
        )
        ?.run();


    },
    []
  );



  /**
   * Copy editor content
   */
  const copyCode = useCallback(
    async () => {


      const code =
        getValue();


      if (!code) {

        return;

      }


      await navigator.clipboard
        .writeText(code);


    },
    [
      getValue,
    ]
  );



  /**
   * Reset editor
   */
  const resetEditor = useCallback(
    (
      defaultCode:string = ""
    ) => {


      setValue(
        defaultCode
      );


      focus();


    },
    [
      setValue,
      focus,
    ]
  );



  /**
   * Insert text at cursor position
   */
  const insertText = useCallback(
    (
      text:string
    ) => {


      if (!editorRef.current) {

        return;

      }


      const editor =
        editorRef.current;


      const selection =
        editor.getSelection();


      editor.executeEdits(
        "insert-text",
        [
          {
            range: selection,

            text,

            forceMoveMarkers:true,
          },
        ]
      );


    },
    []
  );



  /**
   * Get selected text
   */
  const getSelectedText =
    useCallback(
      ():string => {


        if (!editorRef.current) {

          return "";

        }


        const editor =
          editorRef.current;


        const selection =
          editor.getSelection();



        return editor
          .getModel()
          .getValueInRange(
            selection
          );


      },
      []
    );



  return {

    editorRef,

    monacoRef,


    handleEditorMount,


    getValue,

    setValue,

    focus,

    formatCode,

    copyCode,

    resetEditor,

    insertText,

    getSelectedText,

  };

}