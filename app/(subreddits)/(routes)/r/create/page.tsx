

import CreateCommunity from "@/components/CreateCommunity";

const page = () => {
  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <CreateCommunity />
      </div>
    </div>
  );
};

export default page;
