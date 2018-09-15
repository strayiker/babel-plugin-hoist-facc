export default (root, nodeName, exitCondition) => {
  let node = root;

  do {
    if (exitCondition(node)) {
      return node;
    }

    node = node[nodeName];
  } while (node);

  return null;
};
