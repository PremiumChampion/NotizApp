import { ActionButton, BaseButton, Button, Panel, PanelType, Stack } from "@fluentui/react";
import { Guid } from "guid-typescript";
import * as React from "react";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { FsOperations } from "../fsOperations";
import { INote, IToDoListProps } from "../interfaces";
import { Note } from "./Note";
import { LoadingAnimation } from "./LoadingAnimation/LoadingAnimation";


interface IToDoListState {
    notes: INote[];
    loadedNotes: boolean;
    newNoteId: string;
    showHiddenNotes: boolean;
};

export default class ToDoList extends React.Component<IToDoListProps, IToDoListState> {

    public fsOperations: FsOperations;

    constructor(props: IToDoListProps) {
        super(props);

        this.fsOperations = new FsOperations({ defaults: [], fileName: "toDoList.json", })
        this.state = {
            notes: new Array<INote>(),
            loadedNotes: false,
            newNoteId: null,
            showHiddenNotes: false
        }
    }

    public render() {
        const hiddenNotes = this.state.notes.filter((note: INote, index: number, array: INote[]) => { return note.hidden == true; });
        const visibleNotes = this.state.notes.filter((note: INote, index: number, array: INote[]) => { return note.hidden == false; });

        return (
            <>
                {!this.state.loadedNotes &&
                    <>
                        <LoadingAnimation label={"Lade Notizen..."} />
                    </>
                }
                {this.state.loadedNotes &&
                    <>
                        <Stack horizontal>
                            <ActionButton iconProps={{ iconName: "Add" }} text={`Notiz hinzufügen`}
                                onClick={this.addNote.bind(this)}
                            />
                            {hiddenNotes.length > 0 &&
                                <ActionButton iconProps={{ iconName: "Completed" }} text={`Erledigt`}
                                    onClick={this.toggleHidden.bind(this)}
                                />
                            }
                        </Stack>
                        <hr style={{ margin: "0" }} />
                        {hiddenNotes.length > 0 &&
                            <Panel
                                headerText={`Erledigte Notizen`}
                                isOpen={this.state.showHiddenNotes}
                                onDismiss={this.toggleHidden.bind(this)}
                                type={PanelType.smallFixedFar}
                                closeButtonAriaLabel="Close"
                                styles={{
                                    main: { backgroundColor: "#ededed" },
                                    content: { paddingLeft: "0", paddingRight: "0" }
                                }}

                            >
                                {
                                    hiddenNotes.map((note: INote, index: number, array: INote[]) => {
                                        return (
                                            <div key={`${note.guid}div`} >
                                                <Note
                                                    note={note}
                                                    updateNote={this.updateNotes.bind(this, note.guid.toString(), note)}
                                                    editMode={this.state.newNoteId == note.guid}
                                                    new={this.state.newNoteId == note.guid}
                                                    key={note.guid}
                                                />
                                                {index < array.length - 1 &&
                                                    <hr style={{ margin: "0" }} key={`${note.guid}hr`} />
                                                }
                                            </div>
                                        );
                                    })
                                }
                            </Panel>
                        }
                        {
                            visibleNotes.map((note: INote, index: number, array: INote[]) => {
                                return (
                                    <div key={`${note.guid}div`} >
                                        <Note
                                            note={note}
                                            updateNote={this.updateNotes.bind(this, note.guid, note)}
                                            key={note.guid}
                                            new={this.state.newNoteId == note.guid}
                                        />
                                        {index < array.length - 1 &&
                                            <hr style={{ margin: "0" }} key={`${note.guid}hr`} />

                                        }
                                    </div>
                                );
                            })
                        }
                    </>
                }

            </>
        );
    }

    public toggleHidden(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) {
        this.setState({ showHiddenNotes: !this.state.showHiddenNotes });
    }

    public addNote(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) {
        this.setState((state) => {
            let newState: IToDoListState = JSON.parse(JSON.stringify(state));
            newState.notes.unshift({ expandText: "", markedAsDone: false, title: "", guid: Guid.create().toString(), hidden: false });
            newState.newNoteId = newState.notes[0].guid;
            return newState;
        }, () => {
            this.state;
        });
    }

    public updateNotes(guid: string, oldNote: INote, newNote: INote) {
        let newState: IToDoListState = JSON.parse(JSON.stringify(this.state));
        if (newNote) {
            if (newState.newNoteId != null) {
                if (newNote.guid == newState.newNoteId) {
                    newState.newNoteId = null;
                }
            }
            let index = newState.notes.findIndex((note: INote, index: number, obj: INote[]) => {
                return note.guid == guid;
            });
            if (index != -1) {
                newState.notes[index] = newNote;
            }
        } else {
            if (newState.newNoteId != null) {
                if (oldNote.guid == newState.newNoteId) {
                    newState.newNoteId = null;
                }
            }
            let index = newState.notes.findIndex((note: INote, index: number, obj: INote[]) => {
                return note.guid == guid;
            });
            if (index != -1) {
                newState.notes.splice(index, 1);
            }
        }

        let hidden = newState.notes.findIndex((note: INote, index: number, obj: INote[]) => {
            return note.hidden;
        });

        if (hidden == -1) {
            newState.showHiddenNotes = false;
        }

        this.setState(newState, () => {
            this.fsOperations.set(this.state.notes);
        });
    }

    public componentDidMount() {
        this.fsOperations.get(true)
            .then((data: any) => {
                this.setState({ notes: data, loadedNotes: true });
            });
    }

}

