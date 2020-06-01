
import * as React from "react";
import "./CheckedAnimation.css";


export interface ICheckAnimationProps {
    style?: React.CSSProperties;
    className?: string;
}

export class CheckAnimation extends React.Component<ICheckAnimationProps, {}> {


    public render() {

        return (
            <div className={this.props.className}>
                <div className="success-checkmark" style={this.props.style}>
                    <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                    </div>
                </div>
            </div>
        );
    }
}