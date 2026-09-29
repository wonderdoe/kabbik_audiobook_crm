// components/TreeDiagram.tsx
import React from 'react';
import styles from './TreeDigram.module.css';

type TreeDiagramProps = {
  headingChildren?: React.ReactNode;
  childNodes?: React.ReactNode[];
};

export default function TreeDiagram({ headingChildren, childNodes = [] }: TreeDiagramProps) {
  const getChildNodes = () => {
    return childNodes.filter(child => child != null && child != undefined);

  }
  return (
    <div className={styles.wrapper}>
      {/* Parent Node */}
      <div className={styles.parent}>{headingChildren}</div>

      {/* Connector Lines */}
      <div className={styles.treeLines}>
        <div className={styles.verticalLine}></div>
        <div className={styles.horizontalLine}></div>
        <div className={styles.childConnectors}>
          {/* {childNodes.map((_, i) => (
            <div key={i} className={styles.childLine}></div>
          ))} */}
        </div>
      </div>

      {/* Children */}
      <div className={styles.children}>
        {getChildNodes()?.map((child, i) => (
          <div key={i} className={styles.child}>
            {i===0 && <div className={styles.childBoxFirst}></div>}
            {i===getChildNodes().length-1 && <div className={styles.childBoxLast}></div>}
            <div key={i} className={styles.childLine}></div>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
