
import React from 'react';
import './style.scss';
import { Zap, ArrowRight } from 'lucide-react';

const MockUp = () => {
    const columns = ['Todo', 'In Progress', 'Done'];
    const taskCounts = [3, 2, 1];

    return (
        <section className="previewSection">
            <div className="browser">

                {/* Browser header */}
                <div className="browserHeader">
                    <div className="browserDots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div className="browserAddress">
                        forge.app/workspace
                    </div>
                </div>

                {/* Browser content */}
                <div className="browserContent">

                    {/* Chat panel */}
                    <div className="chatPanel">

                        <div className="chatHeader">
                            <p>Chat</p>
                        </div>

                        <div className="chatMessages">

                            {/* User message */}
                            <div className="userMessageWrapper">
                                <div className="userMessage">
                                    Build a kanban board with 3 columns and drag-and-drop
                                </div>
                            </div>

                            {/* AI message */}
                            <div className="aiMessageWrapper">
                                <div className="aiIcon">
                                    <Zap />
                                </div>

                                <div className="aiMessage">
                                    I'll build a Kanban board with Todo, In Progress,
                                    and Done columns. I'll use
                                    <code> @dnd-kit/core </code>
                                    for smooth drag-and-drop…
                                </div>
                            </div>

                            {/* AI loading */}
                            <div className="aiMessageWrapper">
                                <div className="aiIcon">
                                    <Zap />
                                </div>

                                <div className="loadingMessage">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>

                        </div>

                        {/* Chat input */}
                        <div className="chatFooter">
                            <div className="chatInput">
                                <span>Ask AI to modify…</span>
                                <ArrowRight />
                            </div>
                        </div>
                    </div>

                    {/* Preview panel */}
                    <div className="previewPanel">

                        {/* Tabs */}
                        <div className="previewTabs">
                            <button className="activeTab">Preview</button>
                            <button>Code</button>
                        </div>

                        {/* Kanban board */}
                        <div className="kanbanBoard">

                            {columns.map((column, columnIndex) => (
                                <div className="kanbanColumn" key={column}>

                                    <div className="kanbanColumnHeader">
                                        <span>{column}</span>
                                        <span className="taskCount">
                                            {taskCounts[columnIndex]}
                                        </span>
                                    </div>

                                    {Array.from({
                                        length: taskCounts[columnIndex],
                                    }).map((_, index) => (
                                        <div className="kanbanCard" key={index}>
                                            <div
                                                className="cardLine"
                                                style={{
                                                    width: `${60 + index * 15}%`,
                                                }}
                                            ></div>

                                            <div className="cardLineShort"></div>
                                        </div>
                                    ))}

                                </div>
                            ))}

                        </div>
                    </div>

                </div>
            </div>
        </section>
);

};

export default MockUp;
