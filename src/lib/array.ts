export type Node<T> = {
  value: T;
  parent: Node<T> | null;
  children: Array<Node<T>>;
};

export type Tree<T> = {
  flat: Array<Node<T>>;
  nested: Array<Node<T>>;
};

export const tree = <T>(arr: T[]) =>
  (parent: (x: T, nested: Array<Node<T>>) => Node<T> | null): Tree<T> => {
    const flat: Array<Node<T>> = [];
    const nested: Array<Node<T>> = [];

    for (const x of arr) {
      const node: Node<T> = { parent: parent(x, nested), children: [], value: x };

      flat.push(node);
      if (node.parent) {
        node.parent.children.push(node);
      } else {
        nested.push(node);
      }
    }

    return { flat, nested };
  };
