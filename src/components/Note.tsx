import { ActionButton, BaseButton, Button, Checkbox, Modal, Stack, TextField } from "@fluentui/react";
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import * as React from "react";
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { INote, INoteProps } from "../interfaces";
import { CheckAnimation } from "./CheckAnimation/CheckAnimation";


interface INoteState {
    editMode: boolean;
    data: INote;
    editorState: EditorState;
};

export class Note extends React.Component<INoteProps, INoteState> {


    constructor(props: INoteProps) {
        super(props);
        const contentBlock = htmlToDraft(props.note.expandText);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);

            this.state = {
                editMode: false,
                data: props.note,
                editorState: editorState,
            };
        } else {
            this.state = {
                editMode: false,
                data: props.note,
                editorState: EditorState.createEmpty(),
            };
        }
    }

    public render() {
        return (
            <>
                {(this.props.new || this.state.editMode) &&
                    <Modal
                        isOpen={true}
                        isBlocking={true}
                        onDismiss={this.handleSave.bind(this)}
                    >
                        <div style={{ height: "100%" }}>
                            <TextField
                                label="Titel:"
                                underlined
                                onChange={this.changeTitle.bind(this)}
                                value={this.state.data.title}
                            />
                            <div style={{ backgroundColor: "#ededed", border: "5px solid #ededed", borderRadius: "5px" }}>
                                <div style={{ padding: "10px 15px 0px 15px", maxHeight: "70%", overflow: "hidden" }}>
                                    <div style={{ backgroundColor: "#ffffff", border: "5px solid white", borderRadius: "5px", maxHeight: "828px", overflowY: "auto" }}>
                                        <Editor
                                            placeholder="Weitere Informationen"
                                            toolbarClassName="toolbarClassName"
                                            wrapperClassName="wrapperClassName"
                                            editorClassName="editorClassName"
                                            defaultEditorState={this.state.editorState}
                                            onEditorStateChange={this.onEditorStateChange.bind(this)}
                                            localization={{ locale: "de" }}
                                            toolbar={{
                                                options: ['inline', 'fontSize', 'fontFamily', 'list', 'textAlign'],
                                                inline: { inDropdown: true },
                                                list: { inDropdown: true },
                                                textAlign: { inDropdown: true },
                                                link: { inDropdown: true },
                                                history: { inDropdown: true },
                                            }}
                                        />
                                    </div>
                                </div>
                                <Stack horizontal verticalAlign="center" horizontalAlign={"end"}>
                                    <ActionButton iconProps={{ iconName: `Save` }} text={`Speichern`} onClick={this.handleSave.bind(this)} />
                                    <ActionButton iconProps={{ iconName: `Delete` }} text={this.props.new ? `Verwerfen` : `Löschen`} onClick={this.handleDelete.bind(this)} />
                                </Stack>
                            </div>
                        </div>
                    </Modal>
                }
                {
                    !this.props.new &&
                    <>
                        {this.props.note.title.length > 0 &&
                            <h2 style={{ padding: "15px", backgroundColor: "#ededed", margin: "0", paddingBottom: "0px" }}>{this.state.data.title}</h2>
                        }
                        {(!this.props.note.markedAsDone || this.props.note.hidden == true) &&
                            <>
                                <div style={{ padding: "15px", backgroundColor: "#ededed" }}>
                                    {(this.state.data.expandText != "<p></p>\n" && this.state.data.expandText != "") &&
                                        <div style={{ backgroundColor: "#ffffff", border: "10px solid white", borderRadius: "5px" }}>
                                            <div dangerouslySetInnerHTML={{ __html: this.state.data.expandText }}></div>
                                        </div>
                                    }
                                    <Stack horizontal verticalAlign="center">
                                        <Checkbox defaultChecked={this.state.data.markedAsDone} onChange={this.markNoteAsChecked.bind(this)} label={`Erledigt`} />
                                        {!this.state.data.hidden &&
                                            <ActionButton iconProps={{ iconName: "Edit" }} text={`Bearbeiten`} onClick={this.openEditMode.bind(this)} />
                                        }
                                        {this.state.data.hidden &&
                                            <ActionButton iconProps={{ iconName: `Delete` }} text={`Löschen`} onClick={this.handleDelete.bind(this)} />
                                        }
                                    </Stack >
                                </div>
                            </>
                        }
                        {this.props.note.markedAsDone && this.props.note.hidden == false &&
                            <div style={{ padding: "10px", backgroundColor: "#ededed" }}>
                                <CheckAnimation
                                    style={{ margin: "0 auto", padding: "10px" }}
                                />
                            </div>
                        }
                    </>
                }
            </>
        );
    }

    public markNoteAsChecked(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) {
        let newState: INoteState = JSON.parse(JSON.stringify(this.state));
        newState.data.markedAsDone = !newState.data.markedAsDone;
        newState.data.hidden = false;

        if (checked) {
            setTimeout(this.hideNote.bind(this), 1000);
        }

        this.setState(newState, this.handleSave.bind(this));
    }

    public hideNote() {
        let newState: INoteState = JSON.parse(JSON.stringify(this.state));
        if (newState.data.markedAsDone) {
            newState.data.hidden = true;
            this.setState(newState);
            this.handleSave();
        }
    }

    public openEditMode(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) {
        this.setState({ editMode: true });
    }

    public onEditorStateChange(editorState: EditorState) {
        let data: INote = this.state.data;
        data.expandText = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        if (data.expandText == "<p></p>\n" || this.state.data.expandText == "") {
            editorState = EditorState.createEmpty();
        }
        this.setState({
            editorState: editorState,
            data: data
        });
    };

    public changeTitle(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) {
        let newState: INoteState = JSON.parse(JSON.stringify(this.state));
        newState.data.title = newValue;
        this.setState(newState);
    }

    public handleSave() {
        if (this.state.data.title.length > 0 || (this.state.data.expandText != "<p></p>\n" && this.state.data.expandText != "")) {
            let data = this.state.data;

            if (data.expandText == "<p></p>\n" || data.expandText == "") {
                this.setState({ editorState: EditorState.createEmpty() });
            }

            this.props.updateNote(data);

            this.setState({ editMode: false });

        } else {
            this.handleDelete();
        }
    }

    public handleDelete() {
        this.props.updateNote(undefined);
        this.setState({ editMode: false })
    }

}

