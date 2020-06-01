
import * as React from "react";
import "./LoadingAnimation.css";


export interface ILoadingAnimationProps {
    style?: React.CSSProperties;
    label?: string;
}

export class LoadingAnimation extends React.Component<ILoadingAnimationProps, {}> {

    public render() {
        let style = this.props.style;
        if (!style) {
            style = { display: "flex", flexDirection: "column" };
        }
        return (
            <div style={style}>
                <div className="lds-dual-ring" style={{ margin: "0 auto" }}></div>
                <p style={{ margin: "0 auto" }}>{this.props.label}</p>
            </div>
        );
    }
}