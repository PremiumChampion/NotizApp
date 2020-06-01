
export interface IToDoListProps { }

export interface INote {
    title: string;
    expandText: string;
    markedAsDone: boolean;
    guid: string;
    hidden: boolean;
};

export interface INoteProps {
    note: INote;
    new: boolean;
    updateNote: (newNote: INote) => void;
    editMode?: boolean;
};

