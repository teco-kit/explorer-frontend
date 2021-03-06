import MetadataPanel from '../../components/MetadataPanel/MetadataPanel';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { fakeDataset_One } from '../fakeData/fakeDatasets';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Render page', () => {
  const wrapper = shallow(<MetadataPanel></MetadataPanel>);
  expect(wrapper.html()).not.toEqual('');
});

it('Show values of dataset', () => {
  const wrapper = shallow(
    <MetadataPanel
      id={fakeDataset_One._id}
      start={fakeDataset_One.start}
      end={fakeDataset_One.end}
      user={fakeDataset_One.userId}
      name={fakeDataset_One.name}
    ></MetadataPanel>
  );
  const data = wrapper.find('Input');
  expect(data.get(0).props.value).toEqual(fakeDataset_One.name);
  expect(data.get(1).props.value).toEqual(fakeDataset_One._id);
  expect(data.get(2).props.value).toEqual('12:11:56:000');
  expect(data.get(3).props.value).toEqual('12:11:59:000');
  expect(data.get(4).props.value).toEqual(fakeDataset_One.userId);
});
