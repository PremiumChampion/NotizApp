import { ActionButton, BaseButton, Button, Panel, PanelType, Stack, Text } from "@fluentui/react";
import { Guid } from "guid-typescript";
import * as React from "react";
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { FsOperations } from "../fsOperations";
import { INote, IToDoListProps } from "../interfaces";
import { Note } from "./Note";
import { LoadingAnimation } from "./LoadingAnimation/LoadingAnimation";
import { ipcRenderer } from "electron";


interface IToDoListState {
    notes: INote[];
    loadedNotes: boolean;
    newNoteId: string;
    showHiddenNotes: boolean;
    settingsOpen: boolean;
};

export default class ToDoList extends React.Component<IToDoListProps, IToDoListState> {

    public fsOperations: FsOperations;

    public fsSettings: FsOperations;

    constructor(props: IToDoListProps) {
        super(props);


        this.fsSettings = new FsOperations({ defaults: { fullPath: null }, fileName: "fileSettings.json", });
        this.fsOperations = new FsOperations({ defaults: [], fileName: "toDoList.json", });



        this.state = {
            notes: new Array<INote>(),
            loadedNotes: false,
            newNoteId: null,
            showHiddenNotes: false,
            settingsOpen: false
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
                            <ActionButton style={{ float: "right", marginLeft: "auto" }} iconProps={{ iconName: "Settings" }} text={`Einstellungen`}
                                onClick={this.toggleSettings.bind(this)} />
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
                        {
                            this.state.settingsOpen &&
                            <Panel
                                headerText={`Einstellungen`}
                                isOpen={true}
                                onDismiss={this.toggleSettings.bind(this)}
                                type={PanelType.custom}
                                customWidth={"100%"}
                                closeButtonAriaLabel="Close"
                            // styles={{
                            //     main: { backgroundColor: "#ededed" },
                            //     content: { paddingLeft: "0", paddingRight: "0" }
                            // }}

                            >
                                <Stack
                                    verticalAlign={"start"}
                                >
                                    <Text nowrap >{`Derzeitige Datei: ${this.fsOperations.getFilePath()}`}</Text>
                                    <ActionButton iconProps={{ iconName: "Add" }} text={"Neue Notizdatei öffnen"} style={{ border: "2px solid black" }}
                                        onClick={(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) => {
                                            event.persist();
                                            ipcRenderer.send('open-file-dialog-for-file');
                                        }} />

                                </Stack>
                            </Panel>
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
        this.fsSettings.get(true).then((dir: { fullPath: string | null }) => {

            if (dir.fullPath) {
                this.fsOperations = new FsOperations({ defaults: [], fullPath: dir.fullPath });
            }

            this.fsOperations.get(true)
                .then((data: any) => {
                    this.setState({ notes: data, loadedNotes: true });
                });

        });


        ipcRenderer.on('selected-file', (event, path) => {
            if (path) {
                this.fsSettings.set({ fullPath: path });
                this.fsOperations.get(true)
                    .then((oldData: INote[]) => {

                        let newData: INote[] = [];

                        oldData.forEach((note: INote, index: number, array: INote[]) => {
                            newData.push(note);
                        });

                        this.fsOperations = new FsOperations({ defaults: [], fullPath: path, });

                        this.fsOperations.get(true)
                            .then((data: INote[]) => {

                                data.forEach((note: INote, index: number, array: INote[]) => {
                                    if (oldData.findIndex(oldNote => note.guid != oldNote.guid) == -1) {
                                        newData.unshift(note);
                                    } 
                                });

                                this.setState({ notes: newData, settingsOpen: false });
                                this.fsOperations.set(newData);

                            });
                    });
            }
        });
    }

    public toggleSettings() {
        this.setState({ settingsOpen: !this.state.settingsOpen });
    }

}

